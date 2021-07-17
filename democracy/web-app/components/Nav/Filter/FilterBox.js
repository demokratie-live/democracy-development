import { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// Components
import { Icon } from 'antd';
import SubjectButton from './SubjectButton';
import DocumentTypeButton from './DocumentTypeButton';
import { H3 } from 'Components/shared/Headlines';
import Button from 'Components/shared/Button';

// Helpers
import { subjectGroups } from 'Helpers/subjectGroupToIcon';

// Context
import { Consumer as FilterConsumer } from 'Context/filter';

const Box = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #fdfdfd;
  border-radius: 5px;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    padding-top: ${({ theme }) => theme.space(1)}px;
    padding-bottom: ${({ theme }) => theme.space(1)}px;
    padding-left: ${({ theme }) => theme.space(3)}px;
    padding-right: ${({ theme }) => theme.space(1)}px;
    margin: 60px auto;
  }
`;

const FilterGroup = styled.div`
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    display: flex;
    flex-direction: row;
  }
`;

const FilterGroupTitle = styled.div`
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    display: flex;
    flex-direction: column;
    width: 110px;
  }
  > h3 {
    border-bottom: ${({ active, theme }) =>
      active ? '1px solid' : `1px solid ${theme.colors.inactive}`};
    color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.inactive)};
  }
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    > h3 {
      border-bottom: none;
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const SubjectGroups = styled.div`
  display: ${({ selected }) => (selected ? 'flex' : 'none')};
  flex: 1;
  flex-wrap: wrap;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    padding-top: 32px;
    display: flex;
  }
`;

const AllButton = styled.div`
  display: flex;
  flex-direction: column;
  width: 40px;
  text-align: center;
`;

const Desktop = styled.div`
  display: none;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    display: block;
    width: 80%;
    margin: 0 auto;
  }
`;

const Mobile = styled.div`
  display: block;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    display: none;
  }
`;

const MobileTitles = styled.div`
  display: flex;
  justify-content: space-around;
  > div > h3 {
    cursor: pointer;
  }
`;

const CloseIconWrapper = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const SaveButton = styled(Button)`
  margin-top: ${({ theme }) => theme.space(1)}px;
`;

class FilterBox extends Component {
  state = {
    selected: 'subjectGroups',
  };

  render() {
    const { toggleVisibility } = this.props;
    return (
      <FilterConsumer>
        {({ state, toggleSubjectGroup, toggleAllSubjectGroups, toggleType, toggleAllTypes }) => (
          <>
            <Desktop>
              <Box>
                <FilterGroup>
                  <FilterGroupTitle>
                    <H3>Sachgebiete</H3>
                    <AllButton>
                      <Button
                        type={state.allSubjectGroups ? 'primary' : 'dashed'}
                        shape="circle"
                        size="large"
                        onClick={toggleAllSubjectGroups}
                        icon={'checkmark'}
                      />
                      Alle
                    </AllButton>
                  </FilterGroupTitle>
                  <SubjectGroups selected={this.state.selected === 'subjectGroups'}>
                    {Object.keys(subjectGroups).map(subjectGroup => (
                      <SubjectButton
                        active={state.subjectGroups.indexOf(subjectGroup) !== -1}
                        key={subjectGroup}
                        group={subjectGroup}
                        onClick={() => toggleSubjectGroup(subjectGroup)}
                      />
                    ))}
                  </SubjectGroups>
                </FilterGroup>
                <FilterGroup>
                  <FilterGroupTitle>
                    <H3>Vorgangstypen</H3>
                    <AllButton>
                      <Button
                        type={state.allTypes ? 'primary' : 'dashed'}
                        shape="circle"
                        size="large"
                        onClick={toggleAllTypes}
                        icon={'checkmark'}
                      />
                      Alle
                    </AllButton>
                  </FilterGroupTitle>
                  <SubjectGroups selected={this.state.selected === 'types'}>
                    <DocumentTypeButton
                      active={state.types.indexOf('Gesetzgebung') !== -1}
                      icon="paragraph"
                      title="Gesetze"
                      onClick={() => toggleType('Gesetzgebung')}
                    />
                    <DocumentTypeButton
                      active={state.types.indexOf('Antrag') !== -1}
                      icon="document"
                      title="Anträge"
                      onClick={() => toggleType('Antrag')}
                    />
                  </SubjectGroups>
                </FilterGroup>
                <CloseIconWrapper>
                  <Icon
                    onClick={toggleVisibility}
                    style={{ cursor: 'pointer', fontSize: '24px', color: 'rgb(173,173,176)' }}
                    type="close-circle"
                    theme="outlined"
                  />
                </CloseIconWrapper>
              </Box>
            </Desktop>
            <Mobile>
              <MobileTitles>
                <FilterGroupTitle
                  active={this.state.selected === 'subjectGroups'}
                  onClick={() => this.setState({ selected: 'subjectGroups' })}
                >
                  <H3>Sachgebiete</H3>
                </FilterGroupTitle>
                <FilterGroupTitle
                  active={this.state.selected === 'types'}
                  onClick={() => this.setState({ selected: 'types' })}
                >
                  <H3>Vorgangstypen</H3>
                </FilterGroupTitle>
              </MobileTitles>
              <SubjectGroups selected={this.state.selected === 'subjectGroups'}>
                <SubjectButton
                  active={state.allSubjectGroups}
                  shape="circle"
                  size="large"
                  onClick={toggleAllSubjectGroups}
                  icon={'checkmark'}
                  title="Alle"
                />
                {Object.keys(subjectGroups).map(subjectGroup => (
                  <SubjectButton
                    active={state.subjectGroups.indexOf(subjectGroup) !== -1}
                    key={subjectGroup}
                    group={subjectGroup}
                    onClick={() => toggleSubjectGroup(subjectGroup)}
                  />
                ))}
              </SubjectGroups>
              <SubjectGroups selected={this.state.selected === 'types'}>
                <SubjectButton
                  active={state.allTypes}
                  shape="circle"
                  size="large"
                  onClick={toggleAllTypes}
                  icon={'checkmark'}
                  title="Alle"
                />
                <SubjectButton
                  active={state.types.indexOf('Gesetzgebung') !== -1}
                  shape="circle"
                  size="large"
                  onClick={() => toggleType('Gesetzgebung')}
                  icon={'paragraph'}
                  title="Gesetze"
                />
                <SubjectButton
                  active={state.types.indexOf('Antrag') !== -1}
                  shape="circle"
                  size="large"
                  onClick={() => toggleType('Antrag')}
                  icon={'document'}
                  title="Anträge"
                />
              </SubjectGroups>
              <SaveButton type="primary" block onClick={toggleVisibility}>
                Speichern
              </SaveButton>
            </Mobile>
          </>
        )}
      </FilterConsumer>
    );
  }
}

FilterBox.propTypes = {
  toggleVisibility: PropTypes.func,
};

export default FilterBox;
