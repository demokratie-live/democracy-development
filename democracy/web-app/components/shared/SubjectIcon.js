import styled from 'styled-components';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';

// Helper
import subjectGroupIconHelper, { subjectGroups } from 'Helpers/subjectGroupToIcon';

// Components
import Button from 'Components/shared/Button';
import IconComponent from 'Components/shared/Icon';

const Icon = styled(IconComponent)``;

const SubjectIcon = ({ group, style, onClick }) => (
  <Tooltip placement="bottom" title={group}>
    <Button
      onClick={onClick}
      style={{ marginLeft: 6, border: 0, ...style }}
      type="primary"
      shape="circle"
      size="large"
    >
      <Icon type={subjectGroupIconHelper(group)} />
    </Button>
  </Tooltip>
);

SubjectIcon.propTypes = {
  group: PropTypes.oneOf(Object.keys(subjectGroups)).isRequired,
  onClick: PropTypes.func,
};

SubjectIcon.defaultProps = {
  onClick: () => {},
};

export default SubjectIcon;
