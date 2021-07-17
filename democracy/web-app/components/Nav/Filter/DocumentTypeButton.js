import PropTypes from 'prop-types';
import styled from 'styled-components';

// Components
import Button from 'Components/shared/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  min-height: 130px;
  text-align: center;
`;

const DocumentTypeButton = ({ icon, title, onClick, active }) => (
  <Container>
    <Button
      style={{}}
      type={active ? 'primary' : 'dashed'}
      shape="circle"
      size="large"
      onClick={onClick}
      icon={icon}
    />
    {title}
  </Container>
);

DocumentTypeButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default DocumentTypeButton;
