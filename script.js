(function(){
    'use strict';
    
    var inputIds=['price','landed','fba','referral','ads','other','units'];
    var usd=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
    var usdc=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
    function number(id){var el=document.getElementById(id);var n=Number(el.value);return Number.isFinite(n)?Math.max(0,n):0;}
    function updateEconomics(){
      var price=number('price'),landed=number('landed'),fba=number('fba'),referral=Math.min(100,number('referral'))/100,ads=number('ads'),other=number('other'),units=Math.min(1000000,Math.floor(number('units')));
      var unitcost=landed+fba+(price*referral)+ads+other;
      var contrib=price-unitcost,revenue=price*units,cost=unitcost*units,monthly=contrib*units,margin=price>0?100*contrib/price:0;
      document.getElementById('monthly').textContent=usd.format(monthly);
      document.getElementById('monthly').classList.toggle('negative',monthly<0);
      document.getElementById('perunit').textContent=usdc.format(contrib)+' per unit · '+margin.toFixed(1)+'% contribution margin';
      document.getElementById('revenue').textContent=usd.format(revenue);
      document.getElementById('unitcost').textContent=usdc.format(unitcost);
      document.getElementById('totalcost').textContent=usd.format(cost);
      var contributionShare=price>0?Math.min(100,Math.max(0,margin)):0;
      document.getElementById('costbar').style.width=(100-contributionShare)+'%';
      document.getElementById('contribbar').style.width=contributionShare+'%';
      document.getElementById('stackbar').setAttribute('aria-label',contributionShare.toFixed(1)+'% contribution, balance variable costs; if contribution is negative, losses are not represented by the bar');
    }
    inputIds.forEach(function(id){document.getElementById(id).addEventListener('input',updateEconomics);});updateEconomics();
  })();
  function closeMenu(){var menu=document.getElementById('mobile-menu'),btn=document.getElementById('menu-btn');menu.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.textContent='☰';}
  function toggleMenu(){var menu=document.getElementById('mobile-menu'),btn=document.getElementById('menu-btn');var open=menu.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));btn.textContent=open?'×':'☰';}

  
  



/* ============================================
   AREA71 FOOTER JAVASCRIPT
============================================ */

(function () {

  function initializeArea71Footer() {

    const yearElement = document.getElementById(
      "a71-footer-year"
    );

    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }

  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeArea71Footer,
      { once: true }
    );
  } else {
    initializeArea71Footer();
  }

})();
