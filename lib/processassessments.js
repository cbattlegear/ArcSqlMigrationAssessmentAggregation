let zeroSqlDB = [];
let zeroDBMI = [];

function columnDefCreator(num) {
// Right alight all columns except the first one
cols = []
for(var i = 1; i < num; i++) {
  cols.push({
    targets: i,
    className: 'dt-head-center dt-body-right dt-foot-right' 
  });
}
return cols;
}

function filterGlobal() {
// Get the search term from your global search input
var searchTerm = $('#global_search').val();

// Apply the search term to all DataTables
$.fn.dataTable.tables({ api: true}).search(searchTerm).draw();
}

$(document).ready(function() {

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const numFormat = new Intl.NumberFormat('en-US');

$('#suitability-tables table thead tr').append('<th>Server Name</th><th>Total Databases</th><th># of DB\'s SQL DB Eligible</th><th>Server Eligible for SQL DB?</th><th># of DB\'s DBMI Eligible</th><th>Server Eligible for DBMI?</th>');

suitabilityTotals = {
  "TotalDatabases": 0,
  "TotalSqlDBEligible": 0,
  "TotalDBMIEligible": 0
}

$.each(data.Suitability, function(index, item) {
      if(item.Servers[0].TargetReadinesses.AzureSqlDatabase.NumberOfDatabasesReadyForMigration == 0) {
        zeroSqlDB.push(index);
      }

      if(item.Servers[0].TargetReadinesses.AzureSqlManagedInstance.NumberOfDatabasesReadyForMigration == 0) {
        zeroDBMI.push(index);
      }

      suitabilityTotals.TotalDatabases += item.Servers[0].TargetReadinesses.AzureSqlDatabase.TotalNumberOfDatabases;
      suitabilityTotals.TotalSqlDBEligible += item.Servers[0].TargetReadinesses.AzureSqlDatabase.NumberOfDatabasesReadyForMigration;
      suitabilityTotals.TotalDBMIEligible += item.Servers[0].TargetReadinesses.AzureSqlManagedInstance.NumberOfDatabasesReadyForMigration;

      var row = '<tr>';
      row += '<td>' + index + '</td>';

      row += '<td>' + numFormat.format(item.Servers[0].TargetReadinesses.AzureSqlDatabase.TotalNumberOfDatabases) + '</td>';

      let sqlDbReady = (item.Servers[0].TargetReadinesses.AzureSqlDatabase.RecommendationStatus == 'Ready') ? 'Yes' : 'No';                   
      row += '<td>' + numFormat.format(item.Servers[0].TargetReadinesses.AzureSqlDatabase.NumberOfDatabasesReadyForMigration) + '</td>';
      row += '<td>' + sqlDbReady + '</td>';

      let dbmiReady = item.Servers[0].TargetReadinesses.AzureSqlManagedInstance.RecommendationStatus == 'Ready' ? 'Yes' : 'No';
      row += '<td>' + numFormat.format(item.Servers[0].TargetReadinesses.AzureSqlManagedInstance.NumberOfDatabasesReadyForMigration) + '</td>';
      row += '<td>' + dbmiReady + '</td>';

      row += '</tr>';
      $('#suitability-tables table tbody').append(row);
  });

  $('#suitability-tables table tfoot tr').append('<td>Totals</td><td>' + numFormat.format(suitabilityTotals.TotalDatabases) + '</td><td>' + numFormat.format(suitabilityTotals.TotalSqlDBEligible) + '</td><td></td><td>' + numFormat.format(suitabilityTotals.TotalDBMIEligible) + '</td><td></td>');

  $('#current-server-tables table thead tr').append('<th>Server Name</th><th>Total Databases</th><th>Total Cores</th><th>Max Memory (MB)</th><th>Database Size (MB)</th><th>HA Enabled</th>');
  
  serversTotals = {
    "TotalDatabases": 0,
    "TotalCores": 0,
    "TotalMemory": 0,
    "TotalDatabaseSize": 0
  }

  $.each(data.Suitability, function(index, item) {
    serversTotals.TotalDatabases += item.Servers[0].Properties.NumberOfUserDatabases;
    serversTotals.TotalCores += item.Servers[0].Properties.ServerCoreCount;
    serversTotals.TotalMemory += item.Servers[0].Properties.MaxServerMemoryInUse;
    serversTotals.TotalDatabaseSize += item.Servers[0].Properties.SumOfUserDatabasesSize;

        var row = '<tr>';
        row += '<td>' + index + '</td>';

        row += '<td>' + numFormat.format(item.Servers[0].Properties.NumberOfUserDatabases) + '</td>';
  
        row += '<td>' + numFormat.format(item.Servers[0].Properties.ServerCoreCount) + '</td>';
        row += '<td>' + numFormat.format(item.Servers[0].Properties.MaxServerMemoryInUse) + '</td>';
        row += '<td>' + numFormat.format(item.Servers[0].Properties.SumOfUserDatabasesSize) + '</td>';
        row += '<td>' + item.Servers[0].Properties.IsHadrEnabled + '</td>';

        row += '</tr>';
        $('#current-server-tables table tbody').append(row);
    });

  $('#current-server-tables table tfoot tr').append('<td>Totals</td><td>' + numFormat.format(serversTotals.TotalDatabases) + '</td><td>' + numFormat.format(serversTotals.TotalCores) + '</td><td>' + numFormat.format(serversTotals.TotalMemory) + '</td><td>' + numFormat.format(serversTotals.TotalDatabaseSize) + '</td><td></td>');

  $('#skusqlvm-tables table thead tr').append('<th>Server Name</th><th>VM Size</th><th>Data Disks</th><th>Log Disks</th><th>Compute Cost</th><th>Storage Cost</th><th>IOPS Cost</th><th>Total Cost</th>');
  
  vmCost = {
    "ComputeCost": 0.0,
    "StorageCost": 0.0,
    "IopsCost": 0.0,
    "TotalCost": 0.0
  }

  $.each(data.SKURecommendation_AzureSQLVM, function(index, item) {
    var skuInfo = item.SkuRecommendationForServers[0].SkuRecommendationResults[0];
    var targetSku = skuInfo.TargetSku;

    vmCost.ComputeCost += skuInfo.MonthlyCost.ComputeCost;
    vmCost.StorageCost += skuInfo.MonthlyCost.StorageCost;
    vmCost.IopsCost += skuInfo.MonthlyCost.IopsCost;
    vmCost.TotalCost += skuInfo.MonthlyCost.TotalCost;

    var dataDiskSku = targetSku.DataDiskSizes.length + ' x ' + targetSku.DataDiskSizes[0].Type + ' ' + targetSku.DataDiskSizes[0].Size;

    var logDiskSku = targetSku.LogDiskSizes.length + ' x ' + targetSku.LogDiskSizes[0].Type + ' ' + targetSku.LogDiskSizes[0].Size;

      var row = '<tr>';
      row += '<td>' + index + '</td>';
      row += '<td>' + targetSku.VirtualMachineSize.SizeName + '</td>';
      row += '<td>' + dataDiskSku + '</td>';
      row += '<td>' + logDiskSku + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.ComputeCost) + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.StorageCost) + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.IopsCost) + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.TotalCost) + '</td>';

      row += '</tr>';
      $('#skusqlvm-tables table tbody').append(row);
  });

  $('#skusqlvm-tables table tfoot tr').append('<td>Total Costs</td><td></td><td></td><td></td><td>' + usdFormatter.format(vmCost.ComputeCost) + '</td><td>' + usdFormatter.format(vmCost.StorageCost) + '</td><td>' + usdFormatter.format(vmCost.IopsCost) + '</td><td>' + usdFormatter.format(vmCost.TotalCost) + '</td>');

  $('#skudbmi-tables table thead tr').append('<th>Server Name</th><th>Managed Instance Tier</th><th>Compute Cost</th><th>Storage Cost</th><th>IOPS Cost</th><th>Total Cost</th>');
  
  sqlMiCost = {
    "ComputeCost": 0.0,
    "StorageCost": 0.0,
    "IopsCost": 0.0,
    "TotalCost": 0.0
  }

  $.each(data.SKURecommendation_AzureSQLMI, function(index, item) {
    if(!(zeroDBMI.includes(index))) {
    var skuInfo = item.SkuRecommendationForServers[0].SkuRecommendationResults[0];
    var targetSku = skuInfo.TargetSku;
    var skuLabel = targetSku.ComputeSize + ' ' + targetSku.Category.SqlPurchasingModel + ' ' + targetSku.Category.HardwareType + ' ' + targetSku.Category.SqlServiceTier;
    
    sqlMiCost.ComputeCost += skuInfo.MonthlyCost.ComputeCost;
    sqlMiCost.StorageCost += skuInfo.MonthlyCost.StorageCost;
    sqlMiCost.IopsCost += skuInfo.MonthlyCost.IopsCost;
    sqlMiCost.TotalCost += skuInfo.MonthlyCost.TotalCost;

      var row = '<tr>';
      row += '<td>' + index + '</td>';
      row += '<td>' + skuLabel + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.ComputeCost) + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.StorageCost) + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.IopsCost) + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.TotalCost) + '</td>';

      row += '</tr>';
      $('#skudbmi-tables table tbody').append(row);
    }
  });

  $('#skudbmi-tables table tfoot tr').append('<td>Total Costs</td><td></td><td>' + usdFormatter.format(sqlMiCost.ComputeCost) + '</td><td>' + usdFormatter.format(sqlMiCost.StorageCost) + '</td><td>' + usdFormatter.format(sqlMiCost.IopsCost) + '</td><td>' + usdFormatter.format(sqlMiCost.TotalCost) + '</td>');

  $('#skusqldb-tables table thead tr').append('<th>Server Name</th><th>Database Tier</th><th>Compute Cost</th><th>Storage Cost</th><th>IOPS Cost</th><th>Total Cost</th>');
  
  sqlDbCost = {
    "ComputeCost": 0.0,
    "StorageCost": 0.0,
    "IopsCost": 0.0,
    "TotalCost": 0.0
  }

  $.each(data.SKURecommendation_AzureSQLDB, function(index, item) {
    if(!(zeroSqlDB.includes(index))) {
    var skuInfo = item.SkuRecommendationForServers[0].SkuRecommendationResults[0];
    var targetSku = skuInfo.TargetSku;
    var skuLabel = targetSku.ComputeSize + ' ' + targetSku.Category.SqlPurchasingModel + ' ' + targetSku.Category.HardwareType + ' ' + targetSku.Category.SqlServiceTier;

    sqlDbCost.ComputeCost += skuInfo.MonthlyCost.ComputeCost;
    sqlDbCost.StorageCost += skuInfo.MonthlyCost.StorageCost;
    sqlDbCost.IopsCost += skuInfo.MonthlyCost.IopsCost;
    sqlDbCost.TotalCost += skuInfo.MonthlyCost.TotalCost;

      var row = '<tr>';
      row += '<td>' + index + '</td>';
      row += '<td>' + skuLabel + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.ComputeCost) + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.StorageCost) + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.IopsCost) + '</td>';
      row += '<td>' + usdFormatter.format(skuInfo.MonthlyCost.TotalCost) + '</td>';

      row += '</tr>';
      $('#skusqldb-tables table tbody').append(row);
    }
  });

  $('#skusqldb-tables table tfoot tr').append('<td>Total Costs</td><td></td><td>' + usdFormatter.format(sqlDbCost.ComputeCost) + '</td><td>' + usdFormatter.format(sqlDbCost.StorageCost) + '</td><td>' + usdFormatter.format(sqlDbCost.IopsCost) + '</td><td>' + usdFormatter.format(sqlDbCost.TotalCost) + '</td>');

  $('#suitability-tables table').DataTable({
      "paging": false,
      dom: 'lrti',
      columnDefs: columnDefCreator(6)
  });
  $('#current-server-tables table').DataTable({
      "paging": false,
      dom: 'lrti',
      columnDefs: columnDefCreator(6)
  });
  $('#skusqlvm-tables table').DataTable({
      "paging": false,
      dom: 'lrti',
      columnDefs: columnDefCreator(8)
  });
  $('#skudbmi-tables table').DataTable({
      "paging": false,
      dom: 'lrti',
      columnDefs: columnDefCreator(6)
  });
  $('#skusqldb-tables table').DataTable({
      "paging": false,
      dom: 'lrti',
      columnDefs: columnDefCreator(6)
  });

  $('#global_search').on('keyup', function() {
    filterGlobal();
  });
});