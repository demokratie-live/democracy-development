import { Component } from 'react';
import { withRouter } from 'next/router';
import { Collapse as CollapseComponent, Anchor as AnchorComponent, Spin as AntSpin } from 'antd';
import { Query } from 'react-apollo';
import styled from 'styled-components';
import getConfig from 'next/config';

// Components
import Head from 'next/head';
import ShareButtons from './ShareButtons';
import Overview from './Overview';
import Tags from './Tags';
import DetailsPanel from './Panels/Details';
import DocumentsPanel from './Panels/Documents';
import HistoryPanel from './Panels/History';
import VoteResultsPanel from './Panels/VoteResults';
import AppStimmen from './AppStimmen';

// GraphQL
import PROCEDURE from 'GraphQl/queries/procedure';

// Helpers
import { getImage } from 'Helpers/subjectGroupToIcon';
import { titleByProcedureListType } from '../../lib/helpers/listTypeConvert';

const { publicRuntimeConfig } = getConfig();

const { DOMAIN_DESKTOP } = publicRuntimeConfig;

const AnchorLink = AnchorComponent.Link;
const PanelComponent = CollapseComponent.Panel;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const AsideLeft = styled.div`
  display: flex;
  position: absolute;
  top: 130;
  left: 0;
  z-index: 999;
  background-color: rgba(255, 255, 255, 0.3);
  width: 130px;
  padding-top: ${({ theme }) => theme.space(1)}px;
  padding-left: ${({ theme }) => theme.space(1)}px;
  padding-bottom: ${({ theme }) => theme.space(1)}px;
  border-bottom-right-radius: 5px;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    position: static;
    display: flex;
    justify-content: center;
    width: auto;
    padding-left: ${({ theme }) => theme.space(1)}px;
    padding-right: ${({ theme }) => theme.space(1)}px;
    padding-top: ${({ theme }) => theme.space(0)}px;
    padding-bottom: ${({ theme }) => theme.space(0)}px;
    background-color: transparent;
  }
`;

const AsideRight = styled.div`
  display: none;
  padding-left: ${({ theme }) => theme.space(1)}px;
  padding-right: ${({ theme }) => theme.space(1)}px;

  @media (min-width: 855px) {
    display: block;
    min-width: 270px;
  }
`;

const ContentSection = styled.section`
  flex: 1;
  background-color: ${({ theme }) => theme.backgrounds.secondary};
  padding-bottom: ${({ theme }) => theme.space(1)}px;

  @media (min-width: 1024px) {
    max-width: 70vw;
    min-width: 500px;
  }
`;

const Anchor = styled(AnchorComponent)`
  .ant-anchor-link a {
    font-size: 18px;
    background-color: transparent;
    color: rgb(143, 142, 148);
    padding: 10px;
    border-radius: 3px 0 0 3px;
  }
  .ant-anchor > .ant-anchor-link:first-of-type > a,
  .ant-anchor > .ant-anchor-link:last-of-type > a {
    background-color: rgb(244, 243, 243);
  }
  .ant-anchor-link.ant-anchor-link-active > a {
    background-color: rgb(68, 148, 211) !important;
    color: rgb(255, 255, 255);
  }
`;

const Section = styled.section`
  background-color: ${({ theme }) => theme.backgrounds.secondary};
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    padding-top: ${({ theme }) => theme.space(3)}px;
  }
`;

const ShareAside = styled.aside`
  position: sticky;
  align-self: flex-start;
  top: ${({ theme }) => theme.space(3)}px;
  width: 55px;
`;

const ASide = styled.aside`
  padding-top: ${({ theme }) => theme.space(3)}px;
`;

const Collapse = styled(CollapseComponent)`
  border-top: none;
  border-left: none;
  border-right: none;
`;

const Panel = styled(PanelComponent)`
  padding: 0;

  .ant-collapse-header {
    font-size: 19px;
    background-color: ${({ theme }) => theme.backgrounds.primary};
    padding-left: ${({ theme }) => theme.space(1)}px !important;
    padding-right: ${({ theme }) => theme.space(4)}px !important;

    @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
      padding-left: ${({ theme }) => theme.space(3)}px !important;
    }

    .arrow {
      right: 16px;
      top: 0 !important;
      left: auto !important;
      color: ${({ theme }) => theme.colors.arrow};
      font-size: ${({ theme }) => theme.fontSizes.small} !important;
    }
  }

  .ant-collapse-header .arrow {
    transform: rotate(90deg) !important;
  }

  .ant-collapse-header[aria-expanded='true'] .arrow {
    transform: rotate(180deg) !important;
  }

  .ant-collapse-content {
    .ant-collapse-content-box {
      padding-left: ${({ theme }) => theme.space(1)}px;
      padding-right: ${({ theme }) => theme.space(1)}px;
      padding-bottom: ${({ theme }) => theme.space(1)}px;
      padding-top: ${({ theme }) => theme.space(1.5)}px !important;
      @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
        padding-left: ${({ theme }) => theme.space(3)}px;
        padding-right: ${({ theme }) => theme.space(3)}px;
        padding-bottom: ${({ theme }) => theme.space(3)}px;
      }
    }
  }
`;

const AppStimmenCollapse = styled(Collapse)`
  margin-top: ${({ theme }) => theme.space(3)}px;
`;

const ImageCol = styled.div`
  width: 100%;
  /* min-height: 200px; */
  height: 40vw;
  max-height: 450px;
  overflow: hidden;
  margin: 0;
  position: relative;
`;

const Image = styled.img`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  max-width: 100%;
`;

const SpinWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;
const Spin = styled(AntSpin)``;

class Details extends Component {
  render() {
    const {
      router: { query, asPath },
    } = this.props;

    if (!query.id) {
      return null;
    }

    return (
      <Section>
        {/* Query is empty in first call... */}
        <Query query={PROCEDURE} variables={{ id: query.id }}>
          {({ loading, error, data: { procedure } }) => {
            if (loading)
              return (
                <SpinWrapper>
                  <Spin size="large" tip="Lädt…" />
                </SpinWrapper>
              );
            if (error) return <p>Fehler :(</p>;

            const isCanceled = ['Zurückgezogen', 'Für erledigt erklärt'].some(
              s => s === procedure.currentStatus,
            );

            const hasResults = isCanceled || !!procedure.communityVotes || (
              !!procedure.voteResults && (
                procedure.voteResults.yes ||
                procedure.voteResults.no
              )
            );

            return (
              <>
                <Head>
                  <title>{`${titleByProcedureListType({
                    listType: procedure.list,
                    completed: procedure.completed,
                  })}: ${procedure.title}`}</title>
                  <meta
                    key="og-title"
                    property="og:title"
                    content={`${titleByProcedureListType({
                      listType: procedure.list,
                      completed: procedure.completed,
                    })}: ${procedure.title}`}
                  />
                  <meta
                    key="page-topic"
                    name="page-topic"
                    content={`${titleByProcedureListType({
                      listType: procedure.list,
                      completed: procedure.completed,
                    })}: ${procedure.title}`}
                  />

                  <meta
                    key="apple-itunes-app"
                    name="apple-itunes-app"
                    content={`app-id=1341311162, app-argument=democracyapp://procedure/${
                      procedure.procedureId
                    }`}
                  />
                  <meta
                    key="google-play-app"
                    name="google-play-app"
                    content="app-id=de.democracydeutschland.app"
                  />

                  <meta key="description" name="description" content={procedure.abstract} />
                  <meta key="dc-description" name="DC.Description" content={procedure.abstract} />
                  <meta
                    key="og-description"
                    property="og:description"
                    content={procedure.abstract}
                  />

                  <meta name="keywords" content={procedure.tags.join(', ')} />

                  <meta key="page-type" name="page-type" content="article" />
                  <meta key="og-type" property="og:type" content="article" />

                  <meta key="og-url" property="og:url" content={`${DOMAIN_DESKTOP}${asPath}`} />
                  <meta
                    key="og-image"
                    property="og:image"
                    content={`${DOMAIN_DESKTOP}${getImage(procedure.subjectGroups[0])}_1920.jpg`}
                  />
                </Head>
                <Wrapper>
                  <AsideLeft>
                    <ShareAside>
                      <ShareButtons url={`${DOMAIN_DESKTOP}${asPath}`} />
                    </ShareAside>
                  </AsideLeft>
                  <ContentSection>
                    <ImageCol>
                      <Image
                        src={`${getImage(procedure.subjectGroups[0])}_1920.jpg`}
                        alt={procedure.subjectGroups[0]}
                      />
                    </ImageCol>
                    <Overview
                      title={procedure.title}
                      votes={procedure.votes}
                      subjectGroups={procedure.subjectGroups}
                      voteDate={procedure.voteDate}
                      currentStatus={procedure.currentStatus}
                    />
                    <Tags tags={procedure.tags} />

                    <Collapse defaultActiveKey={['details', 'documents', 'status', 'results']}>
                      <Panel header="Details" key="details" id="details">
                        <DetailsPanel
                          subjectGroups={procedure.subjectGroups}
                          currentStatus={procedure.currentStatus}
                          type={procedure.type}
                          procedureId={procedure.procedureId}
                          submissionDate={procedure.submissionDate}
                          voteDate={procedure.voteDate}
                          abstract={procedure.abstract}
                        />
                      </Panel>
                      {procedure.importantDocuments.length > 0 && (
                        <Panel header="Dokumente" key="documents" id="documents">
                          <DocumentsPanel documents={procedure.importantDocuments} />
                        </Panel>
                      )}
                      {procedure.currentStatusHistory.length > 1 && (
                        <Panel header="Gesetzesstand" key="status" id="status">
                          <HistoryPanel
                            currentStatus={procedure.currentStatus}
                            currentStatusHistory={procedure.currentStatusHistory}
                          />
                        </Panel>
                      )}
                      {hasResults && (
                        <Panel header="Ergebnisse" key="results" id="results">
                          <a id="results" />
                          <VoteResultsPanel
                            communityVotes={procedure.communityVotes}
                            voteResults={procedure.voteResults}
                            currentStatus={procedure.currentStatus}
                            isCanceled={isCanceled}
                          />
                        </Panel>
                      )}
                    </Collapse>
                    <AppStimmenCollapse defaultActiveKey={['vote']}>
                      <Panel header="AppStimmen" key="vote" id="vote">
                        <AppStimmen />
                      </Panel>
                    </AppStimmenCollapse>
                  </ContentSection>

                  <AsideRight>
                    <ASide>
                      <Anchor affix={true} style={{ backgroundColor: 'transparent' }}>
                        <AnchorLink
                          href="#top"
                          title={
                            <>
                              <b>1. {procedure.type}</b> - {procedure.procedureId}
                            </>
                          }
                        >
                          <AnchorLink href="#details" title="Details" />
                          {procedure.importantDocuments.length > 0 && (
                            <AnchorLink href="#documents" title="Dokumente" />
                          )}
                          {procedure.currentStatusHistory.length > 1 && (
                            <AnchorLink href="#status" title="Gesetzesstand" />
                          )}
                          {hasResults && (
                              <AnchorLink href="#results" title="Ergebnisse" />
                          )}
                        </AnchorLink>
                        <AnchorLink href="#vote" title={<b>2. AppStimmen</b>} />
                      </Anchor>
                    </ASide>
                  </AsideRight>
                </Wrapper>
              </>
            );
          }}
        </Query>
      </Section>
    );
  }
}

export default withRouter(Details);
