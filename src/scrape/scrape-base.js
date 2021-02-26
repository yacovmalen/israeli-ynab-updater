import moment from 'moment';
import { SCRAPERS, createScraper } from '../helpers/scrapers';

async function prepareResults(scraperId, scraperName, scraperResult, combineInstallments) {
  return scraperResult.accounts.map((account) => {
    console.log(`${scraperName}: scraped ${account.txns.length} transactions from account ${account.accountNumber}`);

    const txns = account.txns.map((txn) => {
      return {
        company: scraperName,
        account: account.accountNumber,
        dateMoment: moment(txn.date),
        processedDate: moment(txn.processedDate),
        payee: txn.description,
        status: txn.status,
        amount: txn.type !== 'installments' || !combineInstallments ? txn.chargedAmount : txn.originalAmount,
        installment: txn.installments ? `${txn.installments.number} of ${txn.installments.total}` : null,
        total: txn.installments ? txn.installments.total : null,
        notes: txn.memo,
        transactionId: txn.identifier,
        type: txn.type,
      };
    });

    return {
      scraperId,
      scraperName,
      accountNumber: account.accountNumber,
      txns,
    };
  });
}

export default async function (scraperId, credentials, options) {
  const {
    combineInstallments,
    startDate,
    showBrowser,
  } = options;

  const scraperOptions = {
    companyId: scraperId,
    startDate,
    combineInstallments,
    showBrowser,
    verbose: false,
  };
  const scraperName = SCRAPERS[scraperId] ? SCRAPERS[scraperId].name : null;

  if (!scraperName) {
    throw new Error(`unknown scraper with id ${scraperId}`);
  }
  console.log(`scraping ${scraperName}`);

  const scraper = createScraper(scraperOptions);
  scraper.onProgress((companyId, payload) => {
    console.log(`${scraperName}: ${payload.type}`);
  });
  const scraperResult = await scraper.scrape(credentials);

  console.log(`success: ${scraperResult.success}`);
  if (!scraperResult.success) {
    console.log(scraperResult);
    console.log(`error type: ${scraperResult.errorType}`);
    console.log('error:', scraperResult.errorMessage);
    throw new Error(scraperResult.errorMessage);
  }

  return prepareResults(scraperId, scraperName, scraperResult, combineInstallments);
}
