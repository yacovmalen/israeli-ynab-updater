import moment from 'moment';

export const config = {
	forceSingleReport: true,
    dateFormat: "MM/DD/YYYY",
    columns: [
    	{
    		value: 'payee',
    		label: 'Description',
    		order: 2,
    	},
    	{
    		value: 'amount',
    		label: 'Amount',
    		order: 4,
    	},
    	{
    		value: 'note',
    		order: 5,
    	},
    	{
    		label: "Account",
	        value: 'company',
	        order: 6,
      	},
      	{
      		label: 'Account #',
	        value: 'account',
	        order: 7,
      	},
      	{
		    value: 'status',
		    display: false,
	    },
	    {
	        value: 'installment',
	        display: false,
	    },
	    {
	        value: 'total',
	        display: false,
	    },
    ],
    extraColumns: [
    	{
    		value: '',
    		label: 'Category',
    		order: 3,
    		display: true,
    	},
    	{
    		value: '',
    		label: 'Institution',
    		order: 8,
    		display: true,
    	},
    	{
    		value: (row) => moment().format("MM/DD/YYYY"),
    		label: 'Date Added',
    		order: 9,
    		display: true,
    	},
    ],
}