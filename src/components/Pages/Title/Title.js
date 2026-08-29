import React from "react";
import './Title.scss'

const TitlePage = ({title}) => {
  return (
    <div className="titlePageBox">
        <h2>{title}</h2>
    </div>
  )
};

export default TitlePage;
