Write-Progress -Activity "Gathering Assessments from Azure Arc Data" -Status "Getting Azure Arc  SQL Migration Assessments" -PercentComplete 0

$arcResources = Get-AzResource -ResourceType 'microsoft.azurearcdata/sqlserverinstances'

Write-Progress -Activity "Gathering Assessments from Azure Arc Data" -Status "Gathered Azure Arc SQL Migration Assessments" -Completed

$assessmentListParallel = [System.Collections.Concurrent.ConcurrentDictionary[string,object]]::new()
$progress = [System.Collections.Concurrent.ConcurrentDictionary[string,int]]::new()
$assessmentList = @{}

$progress['TotalResources'] = $arcResources.Count * 4
$progress['FinishedResources'] = 0

if ($PSVersionTable.PSVersion.Major -ge 7) {
    $arcResources | ForEach-Object -ThrottleLimit 5 -Parallel {
        $assessmentList = $using:assessmentListParallel
        $progressHold = $using:progress

        $payload = @{
            datasetName = 'MigrationAssessments'
        } | ConvertTo-Json
        $resourceId = $_.ResourceId
        $uri = "https://management.azure.com$ResourceId/getTelemetry?api-version=2024-05-01-preview"
        $request = Invoke-AzRestMethod -Method 'POST' -Uri $uri -Payload $payload
    
        $opStatus = ""
        while ($opStatus -ne "Succeeded") {
            $migrateResult = Invoke-AzRestMethod -Method 'GET' -Uri $request.Headers.GetValues('Azure-AsyncOperation')[0]
            $migrateObject = $migrateResult.Content | ConvertFrom-Json
            $opStatus = $migrateObject.status
            if ($opStatus -ne "Succeeded") {
                Start-Sleep -Seconds 1
            } else {
                break
            }
        }
    
        $migrationRows = $migrateObject.properties.rows
        #$server = $ResourceId.Split('/')[-1]
        #$migrateObject.properties | ConvertTo-Json | Out-File ".\testout\$server.json" -Force
        if ($migrationRows.Length -eq 0) {
            Write-Warning "No data returned for $resourceId - skipping"
            $progressHold['FinishedResources']++
            break
        }
        
        $migrationRows | ForEach-Object {
    
            $assessment = $_[1] | ConvertFrom-Json
            $assessmentType = $_[0]

            $serverName = ""
            if ($assessmentType -eq "Suitability") {            
                #Write-Host $_[1]
                $serverName = $assessment.Servers[0].Properties.ServerName
            } else {
                $serverName = $assessment.SkuRecommendationForServers[0].ServerName
            }

            $progressHold['FinishedResources']++
        Write-Progress -Activity "Processing Assessments" -PercentComplete (($progressHold['FinishedResources'] / $progressHold['TotalResources']) * 100) -Status "Processing $serverName"

            # Write-Host "Server Name: $serverName, Assessment Type: $assessmentType"
            try {
             
                if ($assessmentList.ContainsKey($assessmentType) -eq $false) {
                    $assessmentList[$assessmentType] = @{}
                }   
    
                $assessmentList[$assessmentType][$serverName] = $assessment
            }
            catch {
                Write-Host "Output broken for $resourceId"
                Write-Host $assessment | ConvertTo-Json
            }
            
        }
    }
    $assessmentList = $assessmentListParallel

    Write-Progress -Activity "Processing Assessments" -PercentComplete 100 -Status "Finsihed Processing Assessments"
} else {
    $arcResources | ForEach-Object {

        $payload = @{
            datasetName = 'MigrationAssessments'
        } | ConvertTo-Json
        $resourceId = $_.ResourceId
        $uri = "https://management.azure.com$ResourceId/getTelemetry?api-version=2024-05-01-preview"
        $request = Invoke-AzRestMethod -Method 'POST' -Uri $uri -Payload $payload
    
        $opStatus = ""
        while ($opStatus -ne "Succeeded") {
            $migrateResult = Invoke-AzRestMethod -Method 'GET' -Uri $request.Headers.GetValues('Azure-AsyncOperation')[0]
            $migrateObject = $migrateResult.Content | ConvertFrom-Json
            $opStatus = $migrateObject.status
            if ($opStatus -ne "Succeeded") {
                Start-Sleep -Seconds 1
            } else {
                break
            }
        }
    
    
    
        $migrationRows = $migrateObject.properties.rows
    
        $migrationRows | ForEach-Object {
    
            $assessment = $_[1] | ConvertFrom-Json
            $assessmentType = $_[2]
    
    
    
            $serverName = ""
            if ($assessmentType -eq "Suitability") {            
                #Write-Host $_[1]
                $serverName = $assessment.Servers[0].Properties.ServerName
            } else {
                $serverName = $assessment.SkuRecommendationForServers[0].ServerName
            }
            
            Write-Host "Server Name: $serverName, Assessment Type: $assessmentType"
            try {
             
                if ($assessmentList.ContainsKey($assessmentType) -eq $false) {
                    $assessmentList[$assessmentType] = @{}
                }   
    
                $assessmentList[$assessmentType][$serverName] = $assessment
            }
            catch {
                Write-Host "Output broken for $resourceId"
                Write-Host $assessment | ConvertTo-Json
            }
            
        }
    }
}

$jsonOut = $assessmentList | ConvertTo-Json -Depth 20

$template = Get-Content -Path .\template.html -Raw

$template = $template -replace '{}; // #REPLACE WITH MIGRATION DATA#;', $jsonOut

$datatablesCss = Get-Content -Path .\lib\datatables.min.css -Raw

$template = $template.Replace('/* # REPLACE WITH DATATABLES CSS # */', $datatablesCss)

$datatables = Get-Content -Path .\lib\datatables.min.js -Raw

$template = $template -replace '// # REPLACE WITH DATATABLES JS #', $datatables

$datatablesBootstrap = Get-Content -Path .\lib\dataTables.bootstrap5.js -Raw

$template = $template -replace '// # REPLACE WITH DATATABLES BOOTSTRAP JS #', $datatablesBootstrap

$processassessmentsJs = Get-Content -Path .\lib\processassessments.js -Raw

$template = $template -replace '// # REPLACE WITH PROCESSASSESSMENTS JS #', $processassessmentsJs

$issuesListJson = Get-Content -Path .\lib\issues.json -Raw

$template = $template -replace '{}; // #REPLACE WITH ISSUE LIST#;', $issuesListJson

$date = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"

$outputPath = ".\output-$date.html"

$template | Out-File -FilePath $outputPath

$jsonOut | Out-File -FilePath ".\output-$date.json"

$fullPath = Resolve-Path $outputPath

Write-Host "Assessment data collected and written to $fullPath"
Write-Host "If you are using Cloud Shell, you can download the file by clicking the download button in the toolbar above and pasting the path below:`n"

Write-Host ($fullPath.ToString().Replace("$HOME", '').TrimStart('\').TrimStart('/'))
