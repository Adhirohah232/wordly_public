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
    if (showSearchResult) {
      setShowSearchResult(false);
      return;
    }
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
            {loading ? 'Searching...' : showSearchResult ? 'Hide Search Result' : 'Search'}
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
      </div>
    </div>
  );
};

export default Quiz;
