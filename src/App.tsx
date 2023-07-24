import React, { useEffect, useState } from 'react';
import './App.css';
import Api from './components/Api';

function App() {

  const [url, setUrl] = useState<string>('');
  const [currentTextPage, setCurrentTextPage] = useState<string>('');

  /**
   * Get current URL
   */
  useEffect(() => {
    const queryInfo = { active: true, currentWindow: true };

    var chrome = window.chrome || { tabs: { query: (queryInfo: any, callback: any) => { }, executeScript: (tabId: any, details: any, callback: any) => { }  }};

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
      const activeTab = tabs[0];

      const regex = /^.*\?$/gm;
      const elementsWithQuestionMark = [];
      
      function traverseDOM(node: any) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const text = node.textContent.trim();
          if (regex.test(text)) {
            elementsWithQuestionMark.push(node);
          }
        }
      
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
          traverseDOM(children[i]);
        }
      }
      
      // Fonction d'injection de script
      function injectScript(code: any) {
        const script = document.createElement('script');
        script.textContent = code;
        document.documentElement.appendChild(script);
        script.remove();
      }
      
      // Code à exécuter dans le contexte de la page
      const scriptCode = " \
      (${traverseDOM.toString()})(document.documentElement);\
      \
      // Ajouter une bulle à côté de chaque élément correspondant\
      (${function () {\
        elementsWithQuestionMark.forEach((element) => {\
          const bubble = document.createElement('div');\
          bubble.classList.add('bubble');\
          bubble.textContent = '?';\
          element.insertAdjacentElement('afterend', bubble);\
        });\
      }.toString()})();\
      ";
      
      // Injection du script dans la page active
      injectScript(scriptCode);

      chrome.tabs.executeScript(activeTab.id || 0, { code: 'document.documentElement.outerText' }, (result: any[]) => {
        const htmlContent = result[0];

        const regex = /^.*\?$/gm;

        let linesEndingWithQuestionMark = htmlContent.match(regex);

        if (linesEndingWithQuestionMark.length > 0) {
          linesEndingWithQuestionMark = linesEndingWithQuestionMark.join('\n')
        } else {
          linesEndingWithQuestionMark = '';
        }

        setCurrentTextPage(linesEndingWithQuestionMark);

      });
      setUrl(activeTab.url || '');
    });

  }, []);



  return (
    <div className="App">
      <header className="App-header">

        URL : {url}


      </header>
      <Api currentText={currentTextPage} />

    </div>
  );
}

export default App;
