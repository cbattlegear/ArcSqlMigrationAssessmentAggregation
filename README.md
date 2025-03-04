## Arc SQL Migration Assessment Aggregation

Azure Arc enabled SQL Servers will perform weekly (if not explicitly disabled) assessments to review the SQL Servers for Azure compatibility and potential targets. 
This data is available within Azure but not directly exposed in the Azure portal. This tools aggregates that data to create a report for review of any potential migrations to SQL in Azure.

### [Example Output](https://cbattlegear.github.io/ArcSqlMigrationAssessmentAggregation/example_output.html)

## Usage

To run the assessments, the easiest method is to use Azure Cloud Shell. 

- Go to https://shell.azure.com and switch to a PowerShell session
- Run `git clone https://github.com/cbattlegear/ArcSqlMigrationAssessmentAggregation.git` to copy the script to your cloud shell
- Move into the `ArcSqlMigrationAssessmentAggregation` directory by running `cd ArcSqlMigrationAssessmentAggregation`
- Run `./AggregateAssessments.ps1` to gather the assessment data
- Download your assessment data using the path provided by the script in the "Manage Files" menu item

## Output

If you need more information about how to interpret the output, check out our documentation. 

[Output Documentation](docs/output.md)
  
## Disclaimer

This assessment is a best effort analysis of your environment and is always beneficial if not suggested to further review these results and environment to ensure accuracy and applicability.

If any eligibility issues for any of the Azure SQL managed offerings or desire for a deeper assessments, a common tool for individual or small quantity of databases to use is [Data Migration Assistant](https://learn.microsoft.com/en-us/sql/dma/dma-overview?view=sql-server-ver16) 
or for larger scale assessments [Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/migrate-services-overview)
