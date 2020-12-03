class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return <div>{this.props.text}</div>;
    }

    return (
      <button className={`btn m-btn--pill btn-${this.props.color}`} onClick={() => this.setState({ liked: true })}>
        <i className="flaticon-like"></i>
      </button>
    );
  }
}

/* Render react components */
ReactDOM.render(
  <LikeButton text='I like this.' color='brand'/>,
  document.querySelector('#likeBtn')
);
