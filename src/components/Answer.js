import React from "react";

export default function Answer(props) {
  let answerStyle = {};
  // Dynamically change style to answers
  if (props.checked && props.correct) {
    answerStyle = {
      backgroundColor: "#94D7A2",
      border: "none",
    };
  } else if (props.checked && props.heldIncorrect) {
    answerStyle = {
      backgroundColor: "#F8BCBC",
      opacity: 0.5,
      border: "none",
    };
  } else {
    answerStyle = {
      backgroundColor: props.isHeld ? "#D6DBF5" : "white",
      cursor: "pointer",
    };
  }

  return (
    <div
      className="answer"
      style={answerStyle}
      onClick={props.runHold}
      dangerouslySetInnerHTML={{ __html: props.answer }}
    />
  );
}
