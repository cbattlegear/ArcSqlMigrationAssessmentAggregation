## Assessment Output Description

### Common Columns
  - **Server Name**: Represents the Hostname/Instance name for all SQL instances configured by Azure Arc. If no instance is indicated after the hostname it is due to the instance being a default installed instance on the host.
  - **Total Databases**: Indicating the number of user databases under the SQL Hostname/Instance.

### Migration Suitability Results

Validates whether the instance is currently eligible to move to a managed (PaaS) offering of SQL in Azure.

- **# of DB's SQL DB Eligible**: Quantity of databases on the instance that individually are currently eligible to move to Azure SQL Database.
  
- **Server Eligible**: Indicates whether the entire instance as it stands is eligible to migrate to Azure SQL Database, one or more databases that are not eligible would indicate this as 'no'.

- **# of DB's DBMI Eligible**: Quantity of databases on the instance that individually are currently eligible to move to Azure SQL Managed Instance.

- **Server Eligible for DBMI**: Indicates whether the entire instance as it stands is eligible to migrate to Azure SQL Managed Instance, one or more databases that are not eligible would indicate this as 'no'.

### Current Server Resources

Simple overview of the Hostname/Instance configurations and high level HA status.

- **Total Cores**: Numbers of cores configured for the indicated SQL Hostname/Instance.
  
- **Max Memory (MB)**: Total RAM configured for the indicated SQL Hostname/Instance in Megabytes.
  
- **Database Size (MB)**: Sum of all databases sizes in for the indicated SQL Hostname/Instance in Megabytes.
  
- **HA Enabled**: Indicated server is utilizing Always On or Failover Cluster Instances (FCI).

### Azure SQL VM Recommendations

 This is best effort information of suggested Azure Virtual Machine sizing, disk(s) configuration and potential cost based upon the assessment. Factors such as region can influence cost and warrant further cost review of decided VM configuration.

- **VM Size**: Proposed VM Size to select as a VM for the given instance. To better understand VM Sizing in Azure go [here](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview).
  
- **Data Disks**: Suggested disks and quantity to use for the data files of the instance database(s).
  
- **Log Disks**: Suggested disks and quantity to use for the log files of the instance database(s). While not required to separate from the data disks, best practice for IO performance in SQL suggests maintaining the log and data files separately.

- **Compute Cost**: Monthly cost of suggested VM size, not including the configured disks.

- **Storage Cost**: Monthly cost of all suggested disks and quantities.

- **IOPS Cost**: Cost for disks configured to have larger IOPS quantities. Some disks allow for tunable IOPS of that same disk size, those costs are reflected here.

- **Total Cost**: Monthly sum of Compute, Storage and additional IOPS cost for proposed SQL environment in Azure.