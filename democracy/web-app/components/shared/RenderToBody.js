import { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class RenderToBody extends Component {
  constructor(props) {
    super(props);
    if (process.browser) {
      this.el = document.createElement('div');
      this.el.id = props.id;
    }
  }
  componentDidMount() {
    if (process.browser) {
      document.body.appendChild(this.el);
    }
  }

  componentWillUnmount() {
    if (process.browser) {
      document.body.removeChild(this.el);
    }
  }

  render() {
    if (process.browser) {
      return ReactDOM.createPortal(this.props.children, this.el);
    } else {
      return null;
    }
  }
}

RenderToBody.propTypes = {
  id: PropTypes.string.isRequired,
};

export default RenderToBody;
