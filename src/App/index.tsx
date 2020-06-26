import React, {useState} from 'react';
import './App.css';
import http from "../http";
import Button from '@material-ui/core/Button';

const api_key = '1e96813fc5159ae3032d4c268aa8d644';
const city = 'London';
const url = `/weather?q=${city}&appid=${api_key}`;

const App = () => {
  const [response, setResponse] = useState('');
  const [cacheMessage, setCacheMessage] = useState('');
  const [timeTaken, setTimeTaken] = useState<number | null>(null);

  const onClickHandler = () => {
    const startTime = Date.now();
    http.get(url)
      .then(response => {
        setTimeTaken(Date.now() - startTime);
        if (response.headers.cached === true) {
          setCacheMessage('Serving from cache.');
        } else {
          setCacheMessage('Serving very fresh.');
        }
        setResponse(JSON.stringify(response.data, null, '\t'));
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <Button variant="contained" color="primary" onClick={onClickHandler}>CLICK</Button>
        <h4 style={{display: timeTaken ? 'inherit' : 'none'}}>Time taken: {timeTaken}ms</h4>
        <h3>{response}</h3>
        <h4>{cacheMessage}</h4>
      </header>
    </div>
  );
}

export default App;
