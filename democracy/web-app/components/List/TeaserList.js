import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroller';
import { Row, Col, Spin as SpinComponent } from 'antd';
import styled from 'styled-components';

// Components
import Teaser from './Teaser';

const Spin = styled(SpinComponent)`
  width: 100%;
  padding-top: ${({ theme }) => theme.space(1)}px;
`;

const TeaserRow = styled(Row).attrs({
  gutter: ({ theme }) => theme.space(2),
})``;

const TeaserCol = styled(Col).attrs({
  xs: 24,
  md: 12,
  xl: 8,
  xxl: 6,
})`
  padding-top: ${({ theme }) => theme.space(1)}px;
  padding-bottom: ${({ theme }) => theme.space(1)}px;
`;

const TeaserList = ({ loadMore, procedures, hasMore, pageStart, listType }) => {
  //
  return (
    <InfiniteScroll
      pageStart={pageStart}
      loadMore={loadMore}
      hasMore={hasMore}
      loader={<Spin size="large" key="spinner" tip="Lädt mehr…" />}
    >
      <TeaserRow>
        {procedures.map(({ procedureId, ...rest }) => (
          <TeaserCol key={procedureId}>
            <Teaser procedureId={procedureId} listType={listType} {...rest} />
          </TeaserCol>
        ))}
      </TeaserRow>
    </InfiniteScroll>
  );
};

TeaserList.propTypes = {
  loadMore: PropTypes.func.isRequired,
  procedures: PropTypes.array.isRequired,
  hasMore: PropTypes.bool.isRequired,
  pageStart: PropTypes.number,
  listType: PropTypes.string,
};

TeaserList.defaultProps = {
  pageStart: 0,
};

export default TeaserList;
