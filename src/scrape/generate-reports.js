import { parse as objToCsv } from 'json2csv';
import colors from 'colors/safe';
import moment from 'moment';
import lodash from 'lodash';
import { config } from '../config.js';
import { DATE_TIME_FORMAT, TRANSACTION_STATUS } from '../constants';
import { writeFile } from '../helpers/files';

function getReportFields(isSingleReport) {
  const columns = [
    {
      label: 'Date',
      value: (row) => row.dateMoment.format(config.dateFormat || 'DD/MM/YYYY'),
      order: 1,
      display: true,
    },
    {
      label: 'Payee',
      value: 'payee',
      order: 40,
      display: true,
    },
    {
      label: 'Inflow',
      value: 'amount',
      order: 50,
      display: true,
    },
    {
      label: 'Status',
      value: 'status',
      order: 60,
      display: true,
    },
    {
      label: 'Installment',
      value: 'installment',
      order: 70,
      display: true,
    },
    {
      label: 'Total',
      value: 'total',
      order: 80,
      display: true,
    },
    {
      label: 'Note',
      value: 'note',
      order: 90,
      display: true,
    },
    {
      label: 'Transaction Id',
      value: 'transactionId',
      order: 100,
      display: false,
    },
    {
      label: 'Processed Date',
      value: 'processedDate',
      order: 110,
      display: false,
    },
    {
      label: 'Type',
      value: 'type',
      order: 120,
      display: true,
    },
  ];

  if (!isSingleReport || config.forceSingleReport ) {
    columns.unshift(
      {
        label: 'Company',
        value: 'company',
        order: 20,
        display: true,
      },
      {
        label: 'Account',
        value: 'account',
        order: 30,
        display: true,
      },
    );
  }

  columns = lodash.map(columns, function(item){return lodash.assign(item, lodash.filter(config.columns, (i)=>{return i.value === item.value;})[0] || {});});
  columns = lodash.union(columns, config.extraColumns);

  return lodash.orderBy(lodash.filter(columns, 'display') , ['order', 'label']);
}

function filterTransactions(transactions, includeFutureTransactions, includePendingTransactions) {
  let result = transactions;

  if (!includeFutureTransactions) {
    const nowMoment = moment();
    result = result.filter((txn) => {
      const txnMoment = moment(txn.dateMoment);
      return txnMoment.isSameOrBefore(nowMoment, 'day');
    });
  }

  if (!includePendingTransactions) {
    result = result.filter((txn) => txn.status !== TRANSACTION_STATUS.PENDING);
  }

  return result;
}

async function exportAccountData(txns, scraperName, accountNumber, saveLocation) {
  const fields = getReportFields(false);
  const csv = objToCsv(txns, { fields, withBOM: true });
  await writeFile(`${saveLocation}/${scraperName} (${accountNumber}).csv`, csv);
}

export async function generateSeparatedReports(
  scrapedAccounts,
  saveLocation,
  includeFutureTransactions,
  includePendingTransactions,
) {
  let numFiles = 0;
  for (let i = 0; i < scrapedAccounts.length; i += 1) {
    const {
      txns: accountTxns,
      accountNumber,
      scraperName,
    } = scrapedAccounts[i];

    const filteredTxns = filterTransactions(
      accountTxns,
      includeFutureTransactions,
      includePendingTransactions,
    );
    if (filteredTxns.length) {
      console.log(colors.notify(`exporting ${accountTxns.length} transactions for account # ${accountNumber}`));
      await exportAccountData(filteredTxns, scraperName, accountNumber, saveLocation);
      numFiles += 1;
    } else {
      console.log(`no transactions for account # ${accountNumber}`);
    }
  }

  console.log(colors.notify(`${numFiles} csv files saved under ${saveLocation}`));
}

export async function generateSingleReport(
  scrapedAccounts,
  saveLocation,
  includeFutureTransactions,
  includePendingTransactions,
) {
  const fileTransactions = scrapedAccounts.reduce((acc, account) => {
    const filteredTransactions = filterTransactions(
      account.txns,
      includeFutureTransactions,
      includePendingTransactions,
    );
    acc.push(...filteredTransactions);
    return acc;
  }, []);
  const filePath = `${saveLocation}/${moment().format(DATE_TIME_FORMAT)}.csv`;
  const fileFields = getReportFields(true);
  const fileContent = objToCsv(fileTransactions, { fields: fileFields, withBOM: true });
  await writeFile(filePath, fileContent);
  console.log(colors.notify(`created file ${filePath}`));
}
