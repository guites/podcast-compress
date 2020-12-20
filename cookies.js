//verifica se o cookie existe, se não, poe o valor como true
//DEFAULT_TRACK
window.onload = function(){
    var selectConsent = document.querySelector('#privacy-consent');
    const consentCookie = getCookieValue('cookie_ua_consent');
    if (consentCookie !== '') {
      window.ua_consent = consentCookie;
    } else {
        window.ua_consent = true;
    }
    this.setSelectValue(window.ua_consent,selectConsent);
    this.ajaxGtmRequest();

    
    selectConsent.addEventListener('change', defineCookieConsent);
}

function setSelectValue(boole,select){
    select.querySelector(`option[value="${boole}"]`).selected = true;
}


function getCookieValue(a) {
  const b = document.cookie.match(`(^|;)\\s*${a}\\s*=\\s*([^;]+)`);
  return b ? b.pop() : '';
}

function defineCookieConsent(e) {
    window.ua_consent = e.target.value;
    //   this.set_cookie_consent = window.cookie_consent_variable;
    const date = new Date();
    const expires = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000).toGMTString();

    document.cookie = `cookie_ua_consent=${window.ua_consent};expires=${expires};`;

    var message = document.querySelector('p.message');
    message.classList.toggle('hidden');
    setTimeout(function(){ message.classList.toggle('hidden'); }, 1000);
    //acredito que não dê pra rodar o GTM duas vezes / ele nao atualiza rodando duas vezes
    // ajaxGtmRequest();
}

function ajaxGtmRequest() {
  const gtmScript = document.createElement('script');
  gtmScript.type = 'text/javascript';
  const gtmCode = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-NK6XWDX');`;
  try {
    gtmScript.appendChild(document.createTextNode(gtmCode));
    document.head.appendChild(gtmScript);
  } catch (e) {
    gtmScript.text = gtmCode;
    document.head.appendChild(gtmScript);
  }
}
