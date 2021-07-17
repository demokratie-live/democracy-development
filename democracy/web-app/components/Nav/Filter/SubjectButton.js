import PropTypes from 'prop-types';
import styled from 'styled-components';

// Helper
import subjectGroupIconHelper, { subjectGroups, getDisplayTitle } from 'Helpers/subjectGroupToIcon';

// Components
import Button from 'Components/shared/Button';
import IconComponent from 'Components/shared/Icon';

const Container = styled.div`
  width: 50%;
  padding-right: ${({ theme }) => theme.space(0.5)}px;
  padding-bottom: ${({ theme }) => theme.space(0.5)}px;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    width: 120px;
    padding-right: 0px;
    padding-bottom: 0px;
  }
`;

const ButtonWrapper = styled.div`
  cursor: pointer;
  display: flex;
  background-color: ${({ theme }) => theme.colors.lightBlue};
  border-radius: 20px;
  align-items: center;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    flex-direction: column;
    background-color: transparent;
    min-height: 130px;
    text-align: center;
  }
`;

const ButtonIconWrapper = styled.div`
  padding-right: 5px;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    padding-right: 0;
  }
`;

const Icon = styled(IconComponent)`
  &:before {
    left: 0.5px;
    top: 3;
  }
`;

const Title = styled.span`
  font-size: 14px;
`;

const SubjectButton = ({ group, onClick, active, icon, title }) => (
  <Container>
    <ButtonWrapper onClick={onClick}>
      <ButtonIconWrapper>
        <Button type={active ? 'primary' : 'dashed'} shape="circle" size="large">
          <Icon type={icon || subjectGroupIconHelper(group)} />
        </Button>
      </ButtonIconWrapper>
      <Title>{title || getDisplayTitle(group)}</Title>
    </ButtonWrapper>
  </Container>
);

SubjectButton.propTypes = {
  group: PropTypes.oneOf(Object.keys(subjectGroups)),
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  icon: PropTypes.string,
  title: PropTypes.string,
};

SubjectButton.defaultProps = {
  icon: '',
  title: '',
};

export default SubjectButton;
