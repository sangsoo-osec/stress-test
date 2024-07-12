# deepbookv3 stress test scripts

This is the code to check how many orders can be filled in a single transaction

This code reflected:
https://github.com/MystenLabs/deepbookv3/pull/175
https://github.com/MystenLabs/deepbookv3/pull/176


1. run the sui-test-validator
```bash
sui-test-validator
```

2. run the stress test script
```bash
cd test-scripts
npm install
ts-node scripts/test.ts
```

if an error occurs, please execute the commands again.

3. result

```
#orders_in_tree 500
try filling 300 orders within single tx
{ status: 'success' }
{
  computationCost: '1873000000',
  storageCost: '101444800',
  storageRebate: '417303612',
  nonRefundableStorageFee: '4215188'
}

#orders_in_tree 1000
try filling 300 orders within single tx
{ status: 'success' }
{
  computationCost: '4424000000',
  storageCost: '160466400',
  storageRebate: '530569908',
  nonRefundableStorageFee: '5359292'
}

#orders_in_tree 1500
try filling 300 orders within single tx
{ status: 'failure', error: 'InsufficientGas in command 1' }
{
  computationCost: '5000000000',
  storageCost: '5183200',
  storageRebate: '5131368',
  nonRefundableStorageFee: '51832'
}
```
This shows that the more complex the tree, the higher the computation cost.
