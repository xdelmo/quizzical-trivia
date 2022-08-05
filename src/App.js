import React from "react";
import Introduction from "./components/Introduction";
import Footer from "./components/Footer";
import Question from "./components/Question";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

export default function App() {
  const [welcome, setWelcome] = React.useState(true);
  const [questions, setQuestions] = React.useState([]);
  const [game, setGame] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [checked, setChecked] = React.useState(false);

  // Function to start game with questions'div
  function handleClick() {
    setWelcome((prevState) => !prevState);
  }

  // Reset all variables to start a new game
  function newGame() {
    setGame((prevState) => !prevState);
    setChecked(false);
    setScore(0);
    setAllAnswersHeld(false);
  }

  // Fetch APIs from OPENTDB
  // Make a new GET everytime game state change
  React.useEffect(() => {
    const apiUrl = "https://opentdb.com/api.php?amount=4&type=multiple";
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        // data object is like:
        //
        // "results": [
        //     {
        //         "category": "Entertainment: Japanese Anime & Manga",
        //         "type": "multiple",
        //         "difficulty": "easy",
        //         "question": "What was Ash Ketchum&#039;s second Pokemon?",
        //         "correct_answer": "Caterpie",
        //         "incorrect_answers": [
        //             "Charmander",
        //             "Pikachu",
        //             "Pidgey"
        //         ]
        //     },
        //    { other objects with category, type, difficulty ecc
        //    }
        // ]

        // listOfQuestions and so question are made as results in fetch data (look at useEffect)
        function getNewQuestions(listOfQuestions) {
          // Create a new array which contains API results
          const resetQuestions = listOfQuestions.map((question) => {
            return {
              // For every question create a new object
              id: nanoid(),
              question: question.question,
              correctAnswer: question.correct_answer,

              answers: settingAnswers(
                // Shuffle answers
                // ...question.incorrect_answers to get single answer
                // to pass to shuffleAnswers an array like
                // [incorrect_answers1, incorrect_answers2, incorrect_answers3, correct_answer]
                // !IMPORTANT
                // If you don't deconstruct question.incorrect_answers
                // you will get an array like
                // [incorrect_answers1incorrect_answers2incorrect_answers3, correct_answer]
                shuffleAnswers([
                  ...question.incorrect_answers,
                  question.correct_answer,
                ]),
                // Pass to settingAnswers all the 4 shuffled answers and the correct one to compare it to them
                // and set correct value to true to only one
                question.correct_answer
              ),
            };
          });
          return resetQuestions;
        }

        // setQuestions with data.results after being manipulated by getNewQuestions
        setQuestions(getNewQuestions(data.results));
      });
  }, [game]);

  // Setup all answers (get 4 answers from listOfAnswers and 1 from correctAnswer)
  function settingAnswers(listOfAnswers, correctAnswer) {
    return listOfAnswers.map((answer) => {
      return {
        id: nanoid(),
        isHeld: false,
        answer: answer,
        // Compare every answer with correctAnswer and set it to true if they are the same
        correct: answer === correctAnswer ? true : false,
        heldCorrect: false,
        heldIncorrect: false,
        checked: false,
      };
    });
  }

  // Fisher-Yates algorithm to shuffle (best one)
  function shuffleAnswers(answerList) {
    let i = answerList.length;
    while (--i > 0) {
      let randIndex = Math.floor(Math.random() * (i + 1));
      [answerList[randIndex], answerList[i]] = [
        answerList[i],
        answerList[randIndex],
      ];
    }
    return answerList;
  }

  // questions contains 4 object made up of question, answers, correct_answer and so on
  const questionElements = questions.map((question) => {
    return (
      <Question
        id={question.id}
        key={question.id}
        question={question.question}
        answers={question.answers}
        runHold={runHold}
      />
    );
  });

  // answerId and questionId are props keys'components
  function runHold(answerId, questionId) {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) => {
        // Compare question.id into questions array to props keys'components clicked questionId
        if (question.id === questionId) {
          // Create a new array that contains every selected answer
          const answersList = question.answers.map((answer) => {
            // If an answer is clicked, it will hold or unhold
            if (answer.id === answerId || answer.isHeld) {
              return {
                ...answer,
                isHeld: !answer.isHeld,
              };
            } else {
              return answer;
            }
          });
          return {
            ...question,
            answers: answersList,
          };
        } else {
          return question;
        }
      })
    );
  }

  // Check answers selected by user
  // questions -> question -> answers -> answer
  function checkAnswers() {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) => {
        // Store answers into checkedAnswers
        const checkedAnswers = question.answers.map((answer) => {
          // Answer selected by user but incorrect
          // return same answer object but with heldIncorrect and checked values modified
          if (answer.isHeld && !answer.correct) {
            return {
              ...answer,
              heldIncorrect: true,
              checked: true,
            };
            // CORRECT answer selected by user
            // return same answer object but with heldIncorrect and checked values modified
          } else if (answer.isHeld && answer.correct) {
            // Increase score counter
            setScore((prevScore) => prevScore + 1);
            return {
              ...answer,
              heldCorrect: true,
              checked: true,
            };
          } else {
            // Answer NOT selected by user
            // return same answer object but with checked value modified
            return {
              // Check answer even if is not checked by user
              ...answer,
              checked: true,
            };
          }
        });
        // When answers mapping is done, return same question object but with checkedAnswers
        return {
          ...question,
          answers: checkedAnswers,
        };
      })
    );
    setChecked(true);
  }

  // State to deny users to check answers without being all selected
  const [allAnswersHeld, setAllAnswersHeld] = React.useState(false);

  React.useEffect(() => {
    let answersHeld = [];

    // questions -> question -> answers -> answer
    //    answer = {
    //         "id": "hnGreNlrMdnKlpRRJ_z8U",
    //         "isHeld": false,
    //         "answer": "Pythagoras",
    //         "correct": false,
    //         "heldCorrect": false,
    //         "heldIncorrect": false,
    //         "checked": false
    //     }

    questions.map((question) => {
      question.answers.map((answer) => {
        if (answer.isHeld) {
          // if one answer in answers array has isHeld as true
          // Push boolean value to answersHeld
          answersHeld.push(answer.isHeld);

          // Dynamically setAllAnswersHeld If answersHeld array has 4 value (so 4 selected answers) or not
          answersHeld.length === 4
            ? setAllAnswersHeld(true)
            : setAllAnswersHeld(false);
        }
        return answer;
      });
      return questions;
    });
  }, [questions]);

  let buttonStyles = {};
  // Dynamically change style to Check answers button
  if (!allAnswersHeld) {
    buttonStyles = {
      backgroundColor: "#d6dbf5",
      color: "#293264",
    };
  }

  return (
    <div className="app">
      <main className="main">
        {welcome ? (
          <Introduction handleClick={handleClick} />
        ) : (
          <div className="app-container">
            {/* Render confetti only if user scores 4/4 */}
            {score === 4 && <Confetti />}
            <svg
              className="blobBL"
              viewBox="0 0 148 118"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-5.55191 4.90596C35.9614 1.77498 82.2425 -9.72149 112.306 19.1094C145.581 51.0203 155.282 102.703 142.701 147.081C130.767 189.18 93.7448 220.092 51.8208 232.476C16.5281 242.902 -15.4332 218.605 -49.1007 203.738C-85.3375 187.737 -133.641 182.993 -145.741 145.239C-158.358 105.868 -132.269 64.5881 -103.064 35.3528C-77.7328 9.99541 -41.2727 7.60006 -5.55191 4.90596Z"
                fill="#DEEBF8"
              />
            </svg>

            {questionElements}
            <div className="btn-container">
              {/*Display btn-container with score and new game button */}
              {checked ? (
                <div>
                  <span className="score">
                    You scored <span className="score-number">{score}</span>/4
                    correct answers
                  </span>
                  <button onClick={newGame} className="btn btn-main">
                    Play again
                  </button>
                </div>
              ) : (
                // Button disabled and with different style if all 4 answers aren't selected
                <button
                  disabled={!allAnswersHeld}
                  onClick={checkAnswers}
                  className="btn btn-main"
                  style={buttonStyles}
                >
                  {allAnswersHeld
                    ? "Check answers"
                    : "Please select all 4 answers"}
                </button>
              )}
            </div>
            <svg
              className="blobTR"
              viewBox="0 0 194 197"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M99.4095 81.3947C71.1213 50.8507 33.3179 21.7816 37.1727 -19.6933C41.4394 -65.599 75.8541 -105.359 118.419 -123.133C158.797 -139.994 206.035 -130.256 241.822 -105.149C271.947 -84.0141 272.823 -43.8756 282.141 -8.27104C292.17 30.0508 318.521 70.8106 296.501 103.779C273.539 138.159 224.991 143.432 183.931 138.768C148.318 134.723 123.751 107.677 99.4095 81.3947Z"
                fill="#FFFAD1"
              />
            </svg>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
