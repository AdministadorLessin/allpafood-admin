
import './ModalRightCont.scss';

const ModalRightCont = ({children,title,addClass}) => {
  return (
    <div className={addClass ? "modalRightCont "+addClass : "modalRightCont"}>
      <div className="titleBox">
        {title &&
          <h3>{title}</h3>
        }
      </div>
      {children}
    </div>
  )
};

export default ModalRightCont;
