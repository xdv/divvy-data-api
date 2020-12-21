// function map (doc) {
function(doc) {

  var time = new Date(doc.close_time_timestamp);
  var timestamp = [
    time.getUTCFullYear(), 
    time.getUTCMonth(), 
    time.getUTCDate(),
    time.getUTCHours(), 
    time.getUTCMinutes(), 
    time.getUTCSeconds()
  ];

  doc.transactions.forEach(function(tx){

    if (tx.metaData.TransactionResult !== 'tesSUCCESS') {
      return;
    }

    if (tx.TransactionType !== 'Payment' && tx.TransactionType !== 'OfferCreate') {
      return;
    }

    var changes = parseBalanceChanges(tx);
    
    if (changes.length > 0) {
      changes.forEach(function(change){
        emit([change.currency, change.issuer].concat(timestamp), [0 - parseFloat(change.value), tx.Account, tx.Destination || null, tx.hash]);
        //log(change);
      });
      
      //log(tx.hash);
    }
    
  });

  function parseBalanceChanges (tx) {

    var accountBalanceChanges = [];
    var account     = tx.Account;
    var destination = tx.Destination || null;
    
    tx.metaData.AffectedNodes.forEach(function(affNode){

      var node = affNode.CreatedNode || affNode.ModifiedNode || affNode.DeletedNode;

      // Look for XDV balance change in AccountRoot node
      if (node.LedgerEntryType === 'AccountRoot') {

        var xdvBalChange = parseAccountRootBalanceChange(node, account);
        
        if (xdvBalChange) {
          xdvBalChange.value += parseFloat(tx.Fee); //remove the fee from the balance change
          
          //if we are still negative, XDV was sent.
          //often this would be zero, indicating only a fee
          //and not really sending XDV
          if (xdvBalChange.value<0) {
            xdvBalChange.value = dropsToXdv(xdvBalChange.value); //convert to XDV
            accountBalanceChanges.push(xdvBalChange);
          }
        }
      }

      // Look for trustline balance change in DivvyState node
      if (node.LedgerEntryType === 'DivvyState') {

        var currBalChange = parseTrustlineBalanceChange(node, account, destination);
        if (currBalChange) {
          accountBalanceChanges.push(currBalChange);
        }

      }

    });

    return accountBalanceChanges;
  }


  function parseAccountRootBalanceChange (node, account) {

/*
    if (node.NewFields) {

      if (node.NewFields.Account === account) {
        return {
          value: dropsToXdv(node.NewFields.Balance),
          currency: 'XDV',
          issuer: ''
        };
      }

    } else if (node.FinalFields) {
*/
      
    if (node.FinalFields && node.FinalFields.Account === account) {

      var finalBal = node.FinalFields.Balance,
        prevBal    = node.PreviousFields.Balance,
        balChange  = finalBal - prevBal;
      
      //if the final balance is greater than the previous, xdv was sent
      if (balChange<0) return {
        value    : balChange,
        currency : 'XDV',
        issuer   : ''
      };
    }


    return null;
  }

  function parseTrustlineBalanceChange (node, account, destination) {

    var balChange = {
        value    : 0,
        currency : '',
        issuer   : ''
      }, 
      trustHigh,
      trustLow,
      trustBalFinal,
      trustBalPrev;

    if (node.NewFields) {
      trustHigh     = node.NewFields.HighLimit;
      trustLow      = node.NewFields.LowLimit;
      trustBalFinal = parseFloat(node.NewFields.Balance.value);
    } else {
      trustHigh     = node.FinalFields.HighLimit;
      trustLow      = node.FinalFields.LowLimit;
      trustBalFinal = parseFloat(node.FinalFields.Balance.value); 
    }

    if (node.PreviousFields && node.PreviousFields.Balance) {
      trustBalPrev = parseFloat(node.PreviousFields.Balance.value);
    } else {
      trustBalPrev = 0;
    }

    //ignore any balance changes that do not affect the sending account
    if (account != trustHigh.issuer && account != trustLow.issuer) {
      return null;  
    }
    
    // Set currency
    balChange.currency = (node.NewFields || node.FinalFields).Balance.currency;

    // Set issuer
    // rules:  
    //    if the balance is negative, the low party is the issuer
    //    if the balance is 0, and the balance was previously negative, the low party is the issuer
    //    if the balance is 0, and the balance was previously positive, the high party is the issuer
    //    if the balance is positive, the high party is the issuer
    if (trustBalFinal < 0)                         balChange.issuer = trustLow.issuer;
    else if (trustBalFinal==0 && trustBalPrev < 0) balChange.issuer = trustLow.issuer; 
    else                                           balChange.issuer = trustHigh.issuer;
    
    balChange.value = parseFloat(trustBalFinal) - parseFloat(trustBalPrev);  

    //if the issuer is sending, invert it because its always positive
    if (balChange.issuer==account) 
      balChange.value = 0 - balChange.value; 
    
    //if its being sent to the issuer and the issuer
    //is the low party, invert it 
    if (balChange.issuer==destination && trustLow.issuer==balChange.issuer)
      balChange.value = 0 - balChange.value;

    //because we are including "OfferCreate", the account's balance
    //could have increased.  therefore, we only want to include 
    //negative balance changes - i.e. balances where money left the
    //sender/initiator's account
    if (balChange.value > 0) return null;
    
    return balChange;
  }

  function dropsToXdv (drops) {
    return parseFloat(drops) / 1000000.0;
  }

  function xdvToDrops (xdv) {
    return parseFloat(xdv) * 1000000.0;
  }

}