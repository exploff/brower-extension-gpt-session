import React, { useState } from 'react';
import { fetchModels, fetchResponse, getToken } from '../api/ChatGpt';
import { ResponseConversation } from '../types';
import spin from '../assets/images/spin.gif';
import './Api.css';

interface ApiProps {
  currentText: string;
}


const Api: React.FC<ApiProps> = (props) => {

  const [inputTextContext, setInputTextContext] = useState('');
  const [questionTextInput, setQuestionTextInput] = useState('');

  const [responseText, setResponseText] = useState('');
  const [inProgress, setInProgress] = useState(false);

  const handleInputChangeContext = (event: any) => {
    setInputTextContext(event.target.value);
  };

  const handleInputChangeQuestion = (event: any) => {
    setQuestionTextInput(event.target.value);
  };

  const handleFormSubmitDetect = async (event: any) => {
    event.preventDefault();

    try {
      setInProgress(true);

      const token = await getToken();
      const model = await fetchModels(token);


      let additionalPrompt = inputTextContext !== "" ? " \n This is the context : " + inputTextContext : "";
      let htlmPageText = props.currentText + additionalPrompt

      let response = await fetchResponse(token, model, htlmPageText);

      let content = (response as ResponseConversation).data.message.content.parts[0];
      console.log(response)
      console.log(content)
      content.replaceAll('\n', '<br />');
      setResponseText(content);

      console.log(response)
      setInProgress(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };



  const handleFormSubmitQuestion = async (event: any) => {
    event.preventDefault();

    if (questionTextInput === "") {
      return;
    }

    try {
      setInProgress(true);

      const token = await getToken();
      const model = await fetchModels(token);

      let response = await fetchResponse(token, model, questionTextInput);
      console.log(response)
      setResponseText((response as ResponseConversation).data.message.content.parts[0]);

      setInProgress(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="wrapper">
        <div>

        <h1>Détecte et répond automatiquement aux questions</h1>

        <form onSubmit={handleFormSubmitDetect}>
          <div>
            <label htmlFor="contexteInput">Contexte (optionnel)</label><br/>
            <input id="contexteInput" type="text" value={inputTextContext} onChange={handleInputChangeContext} />
          </div>
          <button type="submit">Envoyer</button>
        </form>
        </div>
        <div>


        <h1>Pose ta question</h1>

        <form onSubmit={handleFormSubmitQuestion}>
          <div>
            <label htmlFor="questionInput">Question</label><br/>
            <input required={true} id="questionInput" type="textarea" value={questionTextInput} onChange={handleInputChangeQuestion} />
          </div>
          <button type="submit">Envoyer</button>
        </form>
        </div>
      </div>

      <hr />

      {inProgress ? <img src={spin} alt="Loader" />
        :
        <p className="response-content">{responseText}</p>
      }
    </div>
  );
}

export default Api;