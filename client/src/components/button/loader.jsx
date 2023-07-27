import './loader.scss';

export default function Loader() {
  return (
    <div className="lds-ellipsis--wrapper">
      <div className="lds-ellipsis">
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
}
