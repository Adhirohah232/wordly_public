import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const App = () => {
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
  const [typingText, setTypingText] = useState('');
  const [quizActive, setQuizActive] = useState(false);
  const [numberOfAttempts, setNumberOfAttempts] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const message = "Vocabulary refined daily according to insights from 'The Hindu' editorials.";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypingText((prev) => prev + message.charAt(index));
      index += 1;
      if (index === message.length) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Initialize word pairs from localStorage
  useEffect(() => {
    const savedWordPairs = localStorage.getItem('wordPairs');
    if (savedWordPairs) {
      setWordPairs(JSON.parse(savedWordPairs));
    }
  }, []);

  const fetchWordPairs = async () => {
    if (showWordPairs) {
      setShowWordPairs(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get('https://wordly-backend.onrender.com/words/all', { withCredentials: false });
      setWordPairs(response.data);
      localStorage.setItem('wordPairs', JSON.stringify(response.data)); // Save to localStorage
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
      setPasskeyError('Incorrect passkey, only admins can add words');
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

  const handleRandomQuizClick = () => {
    const savedWordPairs = localStorage.getItem('wordPairs');
    if (savedWordPairs) {
      setWordPairs(JSON.parse(savedWordPairs));
      setQuizActive(true);
      setNumberOfAttempts('');
      setCurrentQuestions([]);
    } else {
      alert('No word pairs found, please press- fetch all word pairs button first before starting the Quiz.');
    }
  };

  const startQuiz = () => {
    setUserAnswer('');
    setCorrectAnswers(0);
    setIncorrectQuestions([]);
    const wordsForQuiz = getRandomWords(wordPairs, numberOfAttempts);
    if (wordsForQuiz.length < numberOfAttempts) {
      alert('Not enough words available for quiz');
      setQuizActive(false);
      return;
    }
    setCurrentQuestionIndex(0);
    setCurrentQuestions(wordsForQuiz);
    displayQuestion(wordsForQuiz, 0);
  };

  const getRandomWords = (words, count) => {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const generateOptions = (question) => {
    if (!question) return [];
    const correctOption = Object.values(question)[0][0];
    let allOptions = wordPairs
      .filter(pair => Object.keys(pair)[0] !== Object.keys(question)[0])
      .slice(0, 3)
      .map(pair => {
        const synonyms = Object.values(pair)[0];
        return synonyms[Math.floor(Math.random() * synonyms.length)];
      });

    allOptions.push(correctOption);
    return allOptions.sort(() => 0.5 - Math.random()); // Shuffle options
  };

  const handleAnswerSubmit = () => {
    const question = currentQuestions[currentQuestionIndex];
    const correctAnswer = Object.values(question)[0][0];

    if (userAnswer === correctAnswer) {
      setCorrectAnswers(prevCorrectAnswers => prevCorrectAnswers + 1);
    } else {
      recordIncorrectAnswer(question, userAnswer, correctAnswer);
      setFeedbackMessage(`Wrong! Correct answer: ${correctAnswer}`);
      if (currentQuestionIndex + 1 < numberOfAttempts) {
        setShowFeedbackPopup(true);
        setTimeout(() => {
          setShowFeedbackPopup(false);
          displayQuestion(currentQuestions, currentQuestionIndex + 1);
        }, 3000); // Show feedback for 3 seconds
        return;
      }
    }

    if (currentQuestionIndex + 1 < numberOfAttempts) {
      displayQuestion(currentQuestions, currentQuestionIndex + 1);
    } else {
      endQuiz();
    }
  };

  const recordIncorrectAnswer = (question, userAnswer, correctAnswer) => {
    const questionText = `What is the synonym for '${Object.keys(question)[0]}'?`;
    setIncorrectQuestions(prevIncorrectQuestions => [
      ...prevIncorrectQuestions,
      {
        question: questionText,
        userAnswer: userAnswer || 'No answer selected',
        correctAnswer,
        allSynonyms: Object.values(question)[0]
      }
    ]);
  };

  const displayQuestion = (questions, index) => {
    const question = questions[index];
    const options = generateOptions(question);
    setCurrentQuestionIndex(index);
    setOptions(options); // Ensure options are set correctly before rendering
    setUserAnswer('');
  };

  const endQuiz = () => {
    setQuizActive(false);
    alert(`Quiz completed`);
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between p-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-4xl mb-4 text-center font-serif font-bold text-red-700">🙏WORDLY🙏</h2>
        <p className="my-8 text-center">Note: Vocabulary refined daily according to insights from 'The Hindu' editorials and aeon essays.</p>
        <p className="mb-4 text-center text-red-500">Bulletin: Random Quiz-feature integrated, dated-Quiz will be available soon...</p>

        <button
          className={`bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500 ${loading && 'opacity-50'}`}
          onClick={fetchWordPairs}
          disabled={loading}
        >
          {loading ? 'Loading...' : showWordPairs ? 'Hide Word Pairs' : 'Fetch all Word Pairs'}
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

        {/* Add Words Section */}
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

        {/* Quiz Section */}
        <p className="mt-4 mb-2 text-xl">Want to take a quiz?</p>
        <button
          className="bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500"
          onClick={handleRandomQuizClick}
        >
          Random Quiz
        </button>

        {quizActive && !currentQuestions.length && (
          <div className="mt-4">
            <label className="block mb-2">Number of questions:</label>
            <input
              type="number"
              className="border p-2 mb-4"
              value={numberOfAttempts}
              onChange={(e) => setNumberOfAttempts(e.target.value)}
            />

            <button
              className="bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500"
              onClick={startQuiz}
            >
              Start Quiz
            </button>
          </div>
        )}

        {currentQuestions.length > 0 && currentQuestionIndex < numberOfAttempts && (
          <div className="mt-4">
            <p className="text-xl mb-4">
              What is the synonym for '{Object.keys(currentQuestions[currentQuestionIndex])[0]}'?
            </p>
            {options.map((option, index) => (
              <div key={index}>
                <label>
                  <input
                    type="radio"
                    name="quizOption"
                    value={option}
                    checked={userAnswer === option}
                    onChange={(e) => setUserAnswer(e.target.value)}
                  />
                  {option}
                </label>
              </div>
            ))}
            <button
              className="bg-red-400 text-white py-2 px-4 rounded hover:bg-red-500 mt-2"
              onClick={handleAnswerSubmit}
            >
              Submit
            </button>
          </div>
        )}

        {showFeedbackPopup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg">
              <p>{feedbackMessage}</p>
            </div>
          </div>
        )}

        {!quizActive && incorrectQuestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl mb-4">Summary of Incorrect Answers:</h3>
            {incorrectQuestions.map((question, index) => (
              <div key={index} className="mb-4">
                <p><strong>Question {index + 1}:</strong> {question.question}</p>
                <p><strong>Your answer:</strong> {question.userAnswer}</p>
                <p><strong>Correct answer:</strong> {question.correctAnswer}</p>
                <p><strong>All synonyms:</strong> {question.allSynonyms.join(', ')}</p>
              </div>
            ))}
            <p className="text-xl mt-4">You attempted {numberOfAttempts} questions and answered {correctAnswers} correctly.</p>
            <button
              className="bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500 mt-2"
              onClick={clearLocalStorage}
            >
              Clear_test
            </button>
          </div>
        )}

        {!quizActive && incorrectQuestions.length === 0 && correctAnswers > 0 && (
          <div className="mt-6">
            <p className="text-xl mt-4">You attempted {numberOfAttempts} questions and answered all of them correctly🎉🎉.</p>
            <button
              className="bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500 mt-2"
              onClick={clearLocalStorage}
            >
              Clear_test
            </button>
          </div>
        )}
      </div>
      <footer className="text-center mt-8 py-4">
        Made with ❤️ by Adirohah's Production
      </footer>
    </div>
  );
};

export default App;

