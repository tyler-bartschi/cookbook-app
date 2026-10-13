import "./Authentication.css";

interface Props {
  id: string;
  errorSource: string;
}

const FieldError = (props: Props) => {
  return (
    <>
      {props.errorSource && (
        <div id={props.id} className="field-error">
          {props.errorSource}
        </div>
      )}
    </>
  );
};

export default FieldError;
