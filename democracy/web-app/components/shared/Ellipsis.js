import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

class EllipsisComponent extends PureComponent {
  static displayName = 'Ellipsis';
  constructor(props) {
    super(props);
    const tag = props.tag;
    this.Ellipsis = styled(tag)`
      overflow: hidden;
      text-overflow: ellipsis-word;
      display: -webkit-box;
      line-height: 1.5em; /* fallback */
      height: ${({ lines }) => `${lines * 1.5}em`}; /* fallback */
      -webkit-line-clamp: ${({ lines }) => lines}; /* number of lines to show */
      -webkit-box-orient: vertical;
      font-size: ${({ theme }) => theme.fontSizes.default};
      word-break: break-word;
    `;
  }

  render() {
    const { children, lines } = this.props;
    return <this.Ellipsis lines={lines}>{children}</this.Ellipsis>;
  }
}

EllipsisComponent.propTypes = {
  lines: PropTypes.number,
  tag: PropTypes.string,
};

EllipsisComponent.defaultProps = {
  lines: 1,
  tag: 'div',
};

export default EllipsisComponent;
