import styled from 'styled-components';
import PropTypes from 'prop-types';

// Components
import Icon from 'Components/shared/Icon';
import Link from 'Components/shared/Link';

const Wrapper = styled.div``;

const Document = styled.div`
  &:not(:first-child) {
    padding-top: ${({ theme }) => theme.space(1)}px;
  }
`;

const DocIcon = styled(Icon)`
  padding-right: ${({ theme }) => theme.space(1)}px;
`;

const DocumentsPanel = ({ documents }) => (
  <Wrapper>
    {' '}
    {documents.map(({ editor, type, url, number }, i) => (
      <Document key={i}>
        <DocIcon type="document" />
        <Link href={url} external primary>
          {`${type} (${editor} ${number})`}
        </Link>
      </Document>
    ))}
  </Wrapper>
);

DocumentsPanel.propTypes = {
  documents: PropTypes.arrayOf(PropTypes.shape()),
};

export default DocumentsPanel;
