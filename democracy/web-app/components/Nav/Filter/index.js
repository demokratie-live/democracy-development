import { Component } from 'react';
import styled from 'styled-components';

// Context
import { Consumer as FilterConsumer } from 'Context/filter';

// Components
import { Badge } from 'antd';
import Modal from 'Components/shared/Modal';
import IconComponent from 'Components/shared/Icon';
import ButtonComponent from 'Components/shared/Button';
import RenderToBody from 'Components/shared/RenderToBody';
import FilterBox from './FilterBox';
import { Desktop as DesktopComponent, Mobile } from '../Responsive';

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    max-width: 70px;
  }
`;

const Button = styled(ButtonComponent)`
  border: 0;
  box-shadow: none;
`;

const ArrowIconWrapper = styled.div.attrs({
  type: 'arrow',
})`
  transform: rotate(180deg);
  display: inline-block;
  margin-left: 3px;
`;

const Icon = styled(IconComponent)`
  &:before {
    color: ${({ theme, active }) => (active ? theme.colors.highlight : theme.colors.inactive)};
  }
`;

const ArrowIcon = styled(Icon)`
  &:before {
    top: 0;
    font-size: 12px;
  }
`;

const Desktop = styled(DesktopComponent)`
  pointer-events: none;
  & * {
    pointer-events: auto;
  }
`;

class Filter extends Component {
  state = {
    visible: false,
  };

  hide = () => {
    this.setState({
      visible: false,
    });
  };

  toggleVisibility = () => {
    this.setState({ visible: !this.state.visible });
  };

  handleVisibleChange = visible => {
    this.setState({ visible });
  };
  render() {
    const { visible } = this.state;
    return (
      <FilterConsumer>
        {consumerProps => {
          const { state } = consumerProps;
          return (
            <Wrapper>
              <Desktop>
                <Button onClick={this.toggleVisibility}>
                  <Badge dot={!state.allTypes || !state.allSubjectGroups} offset={[0, 3]}>
                    <Icon type="funnel" active={!state.allTypes || !state.allSubjectGroups} />
                  </Badge>
                  <ArrowIconWrapper>
                    <ArrowIcon type="arrow" active={!state.allTypes || !state.allSubjectGroups} />
                  </ArrowIconWrapper>
                </Button>

                <RenderToBody id="FilterBox">
                  <Modal visible={visible} handleVisibleChange={this.handleVisibleChange}>
                    <Desktop>
                      <FilterBox toggleVisibility={this.toggleVisibility} />
                    </Desktop>
                  </Modal>
                </RenderToBody>
              </Desktop>

              <Mobile dropDownContent={<FilterBox />} dropDownContentStyle={{}}>
                <Icon type="funnel" top={0} />
              </Mobile>
            </Wrapper>
          );
        }}
      </FilterConsumer>
    );
  }
}

export default Filter;
