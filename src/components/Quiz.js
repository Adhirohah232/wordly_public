import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const Quiz = () => {
  const [wordPairs, setWordPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateWordPairs, setDateWordPairs] = useState({});
  const [dateError, setDateError] = useState('');
  const [showWordPairs, setShowWordPairs] = useState(false);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [showDateWordPairs, setShowDateWordPairs] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [canAddWords, setCanAddWords] = useState(false);
  const [showPasskeyInput, setShowPasskeyInput] = useState(false);
  const [wordInputs, setWordInputs] = useState([{ word: '', synonyms: '' }]);
  const [bulkWords, setBulkWords] = useState('');

  const fetchWordPairs = async () => {
    if (showWordPairs) {
      setShowWordPairs(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get('https://wordly-backend.onrender.com/words/all', { withCredentials: false });
      setWordPairs(response.data);
      setShowWordPairs(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const searchWordPair = async () => {
    setLoading(true);
    setSearchResult(null);
    setSearchError('');
    try {
      const response = await axios.get(`https://wordly-backend.onrender.com/words/${searchWord}`, { withCredentials: false });
      if (response.data && Object.keys(response.data).length > 0) {
        setSearchResult(response.data);
        setShowSearchResult(true);
      } else {
        setSearchError('No words found in the database');
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setSearchError('No words found in the database');
    } finally {
      setLoading(false);
    }
  };

  const fetchWordsByDate = async (date) => {
    if (showDateWordPairs) {
      setShowDateWordPairs(false);
      return;
    }
    setLoading(true);
    setDateWordPairs({});
    setDateError('');
    try {
      const formattedDate = format(date, 'd/M/yyyy'); // format the date to d/M/yyyy
      const response = await axios.post(
        'https://wordly-backend.onrender.com/words/date',
        { date: formattedDate },
        { withCredentials: false }
      );
      if (response.data && response.data.words) {
        setDateWordPairs(response.data.words);
        setShowDateWordPairs(true);
      } else {
        setDateError('No words found for this date');
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setDateError('No words found for this date');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWordsButtonClick = () => {
    setShowPasskeyInput(true);
  };

  const handlePasskeySubmit = () => {
    if (passkey === '232527') {
      setCanAddWords(true);
      setPasskeyError('');
    } else {
      setCanAddWords(false);
      setPasskeyError('Incorrect passkey');
    }
  };

  const handleWordChange = (index, event) => {
    const values = [...wordInputs];
    values[index][event.target.name] = event.target.value;
    setWordInputs(values);
  };

  const handleAddWordInput = () => {
    setWordInputs([...wordInputs, { word: '', synonyms: '' }]);
  };

  const handleSubmitWords = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    const formattedDate = format(selectedDate, 'd/M/yyyy');
    const words = {};

    wordInputs.forEach(({ word, synonyms }) => {
      words[word] = synonyms.split(',').map((synonym) => synonym.trim());
    });

    const requestBody = {
      date: formattedDate,
      words: words,
    };

    try {
      await axios.post('https://wordly-backend.onrender.com/words', requestBody, { withCredentials: false });
      alert('Words added successfully');
    } catch (error) {
      console.error('Error adding words:', error);
      alert('Failed to add words');
    }
  };

  const handleBulkWordsChange = (event) => {
    setBulkWords(event.target.value);
  };

  const handleSubmitBulkWords = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    const formattedDate = format(selectedDate, 'd/M/yyyy');
    const words = {};
    const lines = bulkWords.split('\n');

    lines.forEach(line => {
      const parts = line.split(':');
      const word = parts[0].trim();
      const synonyms = parts[1].split(',').map(synonym => synonym.trim());
      words[word] = synonyms;
    });

    const requestBody = {
      date: formattedDate,
      words: words,
    };

    try {
      await axios.post('https://wordly-backend.onrender.com/words', requestBody, { withCredentials: false });
      alert('Words added successfully');
    } catch (error) {
      console.error('Error adding words:', error);
      alert('Failed to add words');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl mb-4">🙏WORDLY🙏</h2>
        <button
          className={`bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500 ${loading && 'opacity-50'}`}
          onClick={fetchWordPairs}
          disabled={loading}
        >
          {loading ? 'Loading...' : showWordPairs ? 'Hide Word Pairs' : 'Fetch Word Pairs'}
        </button>
        {showWordPairs && (
          <ul className="mt-4">
            {wordPairs.map((pair, index) => (
              <li key={index} className="mb-2">
                <strong>{Object.keys(pair)[0]}:</strong> {Object.values(pair)[0].join(', ')}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <h3 className="text-xl mb-4">Search for a Word</h3>
          <input
            type="text"
            className="border p-2 mr-2"
            placeholder="Enter a word"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
          <button
            className={`bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500 ${loading && 'opacity-50'}`}
            onClick={searchWordPair}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {showSearchResult && searchResult && (
            <div className="mt-4">
              <strong>{Object.keys(searchResult)[0]}:</strong> {Object.values(searchResult)[0].join(', ')}
            </div>
          )}
          {searchError && (
            <div className="mt-4 text-red-500">
              {searchError}
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-xl mb-4">Search Words by Date</h3>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            className="border p-2 mr-2"
            placeholderText="Select a date"
          />
          <button
            className={`bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500 ${loading || !selectedDate && 'opacity-50'}`}
            onClick={() => fetchWordsByDate(selectedDate)}
            disabled={loading || !selectedDate}
          >
            {loading ? 'Loading...' : showDateWordPairs ? 'Hide Date Word Pairs' : 'Search by Date'}
          </button>
          {showDateWordPairs && (
            <ul className="mt-4">
              {Object.entries(dateWordPairs).map(([word, synonyms], index) => (
                <li key={index} className="mb-2">
                  <strong>{word}:</strong> {synonyms.join(', ')}
                </li>
              ))}
            </ul>
          )}
          {dateError && (
            <div className="mt-4 text-red-500">
              {dateError}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-xl mb-4">Want to add words?</p>
          {!showPasskeyInput && (
            <button
              className="bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500"
              onClick={handleAddWordsButtonClick}
            >
              Add Words
            </button>
          )}
          {showPasskeyInput && (
            <div>
              <input
                type="password"
                className="border p-2 mr-2"
                placeholder="Enter passkey"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
              />
              <button
                className="bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500"
                onClick={handlePasskeySubmit}
              >
                Submit Passkey
              </button>
              {passkeyError && (
                <div className="mt-4 text-red-500">
                  {passkeyError}
                </div>
              )}
              {canAddWords && (
                <>
                  <div className="mt-4">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="dd/MM/yyyy"
                      className="border p-2 mr-2"
                      placeholderText="Select a date"
                    />
                  </div>
                  {wordInputs.map((input, index) => (
                    <div key={index} className="mt-2">
                      <input
                        type="text"
                        name="word"
                        className="border p-2 mr-2"
                        placeholder="Enter word"
                        value={input.word}
                        onChange={(event) => handleWordChange(index, event)}
                      />
                      <input
                        type="text"
                        name="synonyms"
                        className="border p-2 mr-2"
                        placeholder="Enter synonyms (comma separated)"
                        value={input.synonyms}
                        onChange={(event) => handleWordChange(index, event)}
                      />
                      {index === wordInputs.length - 1 && (
                        <>
                          <button
                            className="bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500 mr-2"
                            onClick={handleSubmitWords}
                          >
                            Add Words
                          </button>
                          <button
                            className="bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500"
                            onClick={handleAddWordInput}
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="mt-4">
                    <textarea
                      className="border p-2 w-full"
                      rows="6"
                      placeholder="Enter words and synonyms in bulk. Format: Word: synonym1, synonym2, ..."
                      value={bulkWords}
                      onChange={handleBulkWordsChange}
                    />
                    <button
                      className="bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500 mt-2"
                      onClick={handleSubmitBulkWords}
                    >
                      Add Bulk Words
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
