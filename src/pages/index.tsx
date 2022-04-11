import dayjs from 'dayjs';

import FilterDropdown from '@/components/molecules/FilterDropdown';
import { Meta } from '@/layout/Meta';
import { Main } from '@/templates/Main';

const data = {
  data: {
    procedures: [
      {
        title:
          'Rüstungsexporte in die Länder des Vorderen und Mittleren Orients sofort stoppen',
        procedureId: '281289',
        type: 'Antrag',
        votes: 3009,
        communityVotes: {
          yes: 2544,
          no: 354,
          abstination: 111,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-09-07T15:00:00.000Z',
        subjectGroups: ['Außenwirtschaft', 'Verteidigung'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 69,
          no: 638,
          abstination: 0,
          notVoted: null,
          decisionText:
            'Der Ausschuss empfiehlt in seiner Beschlussempfehlung auf Drucksache 19/32248, den Antrag der Fraktion Die Linke auf Drucksache 19/32082 abzulehnen. Wer stimmt für diese Beschlussempfehlung? – Wer stimmt dagegen? – Wer enthält sich? – Die Beschlussempfehlung ist mit den Stimmen der Koalitionsfraktionen, der AfD-Fraktion, der FDP-Fraktion und der Fraktion Bündnis 90/Die Grünen gegen die Stimmen der Fraktion Die Linke angenommen.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'AfD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 92,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 67,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 80,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'Linke',
              deviants: {
                yes: 69,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title:
          'Gesetz zur ganztägigen Förderung von Kindern im Grundschulalter (Ganztagsförderungsgesetz - GaFöG)',
        procedureId: '278111',
        type: 'Gesetzgebung',
        votes: 3585,
        communityVotes: {
          yes: 2737,
          no: 547,
          abstination: 301,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-09-07T14:40:00.000Z',
        subjectGroups: [
          'Bildung und Erziehung',
          'Gesellschaftspolitik, soziale Gruppen',
        ],
        currentStatus: 'Verkündet',
        voteResults: {
          yes: 466,
          no: 0,
          abstination: 241,
          notVoted: null,
          decisionText:
            'und Schlussabstimmung. Ich bitte diejenigen, die dem Gesetzentwurf zustimmen wollen, sich zu erheben. – Wer stimmt dagegen? – Wer enthält sich? – Der Gesetzentwurf ist mit den Stimmen der Koalitionsfraktionen und der Fraktion Bündnis 90/Die Grünen bei Enthaltung der AfD-Fraktion, der FDP-Fraktion und der Fraktion Die Linke angenommen.',
          namedVote: false,
          partyVotes: [
            {
              main: 'YES',
              party: 'Union',
              deviants: {
                yes: 246,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'SPD',
              deviants: {
                yes: 153,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'ABSTINATION',
              party: 'AfD',
              deviants: {
                yes: 0,
                abstination: 92,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'Grüne',
              deviants: {
                yes: 67,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'ABSTINATION',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 80,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'ABSTINATION',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 69,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title:
          'Gesetz zur Errichtung eines Sondervermögens "Aufbauhilfe 2021" und zur vorübergehenden Aussetzung der Insolvenzantragspflicht wegen Starkregenfällen und Hochwassern im Juli 2021 sowie zur Änderung weiterer Gesetze (Aufbauhilfegesetz 2021 - AufbhG 2021)',
        procedureId: '281195',
        type: 'Gesetzgebung',
        votes: 1500,
        communityVotes: {
          yes: 856,
          no: 446,
          abstination: 198,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-09-07T13:05:00.000Z',
        subjectGroups: [
          'Gesundheit',
          'Umwelt',
          'Öffentliche Finanzen, Steuern und Abgaben',
        ],
        currentStatus: 'Verkündet',
        voteResults: {
          yes: 344,
          no: 280,
          abstination: 1,
          notVoted: 84,
          decisionText: null,
          namedVote: true,
          partyVotes: [
            {
              main: 'YES',
              party: 'Union',
              deviants: {
                yes: 209,
                abstination: 1,
                no: 10,
                notVoted: 25,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'SPD',
              deviants: {
                yes: 134,
                abstination: 0,
                no: 2,
                notVoted: 16,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'AfD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 78,
                notVoted: 7,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 73,
                notVoted: 7,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 52,
                notVoted: 17,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 57,
                notVoted: 10,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'fraktionslos',
              deviants: {
                yes: 1,
                abstination: 0,
                no: 8,
                notVoted: 2,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title: '10 Punkte für Klimaresilienz und Katastrophenmanagement',
        procedureId: '281284',
        type: 'Antrag',
        votes: 876,
        communityVotes: {
          yes: 519,
          no: 273,
          abstination: 84,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-09-07T13:05:00.000Z',
        subjectGroups: ['Innere Sicherheit', 'Umwelt'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 80,
          no: 627,
          abstination: 0,
          notVoted: null,
          decisionText:
            'Der Ausschuss empfiehlt unter Buchstabe b seiner Beschlussempfehlung auf Drucksache 19/32273, den Antrag der Fraktion der FDP auf Drucksache 19/32080 abzulehnen. Wer stimmt für diese Beschlussempfehlung? – Wer stimmt dagegen? – Wer enthält sich? – Die Beschlussempfehlung ist mit den Stimmen der Koalitionsfraktionen, der AfD-Fraktion, der Fraktion Die Linke, der Fraktion Bündnis 90/Die Grünen gegen die Stimmen der FDP-Fraktion angenommen.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'AfD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 92,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 67,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'FDP',
              deviants: {
                yes: 80,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 69,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title: 'Baurecht ändern - Hilfe für Flutopfer priorisieren',
        procedureId: '281305',
        type: 'Antrag',
        votes: 931,
        communityVotes: {
          yes: 665,
          no: 201,
          abstination: 65,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-09-07T13:05:00.000Z',
        subjectGroups: ['Raumordnung, Bau- und Wohnungswesen', 'Umwelt'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 92,
          no: 615,
          abstination: 0,
          notVoted: null,
          decisionText:
            'Der Ausschuss empfiehlt in seiner Beschlussempfehlung auf Drucksache 19/32258, den Antrag der Fraktion der AfD auf Drucksache 19/32088 abzulehnen. Wer stimmt für diese Beschlussempfehlung? – Wer stimmt dagegen? – Wer enthält sich? – Die Beschlussempfehlung ist mit den Stimmen der Koalitionsfraktionen, der FDP-Fraktion, der Fraktionen Die Linke und Bündnis 90/Die Grünen gegen die Stimmen der AfD-Fraktion angenommen.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'AfD',
              deviants: {
                yes: 92,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 67,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 80,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 69,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title: 'Bevölkerungsschutz statt Klimaschutz',
        procedureId: '281294',
        type: 'Antrag',
        votes: 1395,
        communityVotes: {
          yes: 659,
          no: 688,
          abstination: 48,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-09-07T13:05:00.000Z',
        subjectGroups: ['Innere Sicherheit', 'Umwelt'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 92,
          no: 615,
          abstination: 0,
          notVoted: null,
          decisionText:
            'Der Ausschuss empfiehlt unter Buchstabe a seiner Beschlussempfehlung auf Drucksache 19/32273, den Antrag der Fraktion der AfD auf Drucksache 19/32084 abzulehnen. Wer stimmt für diese Beschlussempfehlung? – Wer stimmt dagegen? – Wer enthält sich? – Die Beschlussempfehlung ist mit den Stimmen der Koalitionsfraktionen, der FDP-Fraktion, der Fraktion Die Linke und der Fraktion Bündnis 90/Die Grünen gegen die Stimmen der AfD-Fraktion angenommen.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'AfD',
              deviants: {
                yes: 92,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 67,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 80,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 69,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title:
          'Gesetz zur Änderung des Gesetzes zur Errichtung eines Sondervermögens "Aufbauhilfe" - Schnelle Hilfe für Betroffene der Hochwasserkatastrophe\r\n(Aufbauhilfefonds-Errichtungsgesetz - AufbhG)',
        procedureId: '280591',
        type: 'Gesetzgebung',
        votes: 487,
        communityVotes: {
          yes: 320,
          no: 107,
          abstination: 60,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-09-07T13:05:00.000Z',
        subjectGroups: ['Umwelt', 'Öffentliche Finanzen, Steuern und Abgaben'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 535,
          no: 172,
          abstination: 0,
          notVoted: null,
          decisionText:
            'Der Haushaltsausschuss empfiehlt unter Buchstabe b seiner Beschlussempfehlung auf Drucksache 19/32275, den Gesetzentwurf der Fraktion der FDP auf Drucksache 19/31715 abzulehnen. Ich bitte diejenigen, die dem Gesetzentwurf zustimmen wollen, um das Handzeichen. – Das sind die FDP-Fraktion und die AfD-Fraktion. Wer stimmt dagegen? – Die übrigen Fraktionen des Hauses. Wer enthält sich? – Niemand. Der Gesetzentwurf ist in zweiter Beratung abgelehnt. Damit entfällt nach unserer Geschäftsordnung die weitere Beratung.',
          namedVote: false,
          partyVotes: [
            {
              main: 'YES',
              party: 'Union',
              deviants: {
                yes: 246,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'SPD',
              deviants: {
                yes: 153,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'AfD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 92,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'Grüne',
              deviants: {
                yes: 67,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 80,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'Linke',
              deviants: {
                yes: 69,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title: 'Katastrophen- und Hochwasserschutz jetzt stärken',
        procedureId: '281236',
        type: 'Antrag',
        votes: 761,
        communityVotes: {
          yes: 612,
          no: 106,
          abstination: 43,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-09-07T13:05:00.000Z',
        subjectGroups: ['Umwelt'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 92,
          no: 615,
          abstination: 0,
          notVoted: null,
          decisionText:
            'Der Ausschuss empfiehlt unter Buchstabe c seiner Beschlussempfehlung die Ablehnung des Antrags der Fraktion der AfD auf Drucksache 19/32089 mit dem Titel „Unterstützung für die Betroffenen der Hochwasserkatastrophe“. Wer stimmt für diese Beschlussempfehlung? – Wer stimmt dagegen? – Wer enthält sich? – Die Beschlussempfehlung ist mit den Stimmen der Koalitionsfraktionen, der FDP-Fraktion, der Fraktion Die Linke und der Fraktion Bündnis 90/Die Grünen gegen die Stimmen der AfD-Fraktion angenommen.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'AfD',
              deviants: {
                yes: 92,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 67,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 80,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 69,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title: 'Unterstützung für die Betroffenen der Hochwasserkatastrophe',
        procedureId: '281308',
        type: 'Antrag',
        votes: 724,
        communityVotes: {
          yes: 524,
          no: 159,
          abstination: 41,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-09-07T13:05:00.000Z',
        subjectGroups: ['Umwelt', 'Öffentliche Finanzen, Steuern und Abgaben'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 92,
          no: 615,
          abstination: 0,
          notVoted: null,
          decisionText:
            'Der Ausschuss empfiehlt unter Buchstabe c seiner Beschlussempfehlung die Ablehnung des Antrags der Fraktion der AfD auf Drucksache 19/32089 mit dem Titel „Unterstützung für die Betroffenen der Hochwasserkatastrophe“. Wer stimmt für diese Beschlussempfehlung? – Wer stimmt dagegen? – Wer enthält sich? – Die Beschlussempfehlung ist mit den Stimmen der Koalitionsfraktionen, der FDP-Fraktion, der Fraktion Die Linke und der Fraktion Bündnis 90/Die Grünen gegen die Stimmen der AfD-Fraktion angenommen.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'AfD',
              deviants: {
                yes: 92,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 67,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 80,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 69,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title:
          'Epidemische Lage von nationaler Tragweite geordnet beenden - Planungs- und Rechtssicherheit gewährleisten - Pandemiemonitoring verbessern',
        procedureId: '281332',
        type: 'Antrag',
        votes: 1895,
        communityVotes: {
          yes: 1399,
          no: 384,
          abstination: 112,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-08-25T16:50:00.000Z',
        subjectGroups: ['Gesundheit', 'Recht'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 80,
          no: 558,
          abstination: 69,
          notVoted: null,
          decisionText:
            'Wer stimmt für den Antrag? – Die FDP-Fraktion. Wer stimmt dagegen? – Die Koalitionsfraktionen, die AfD-Fraktion und die Fraktion Bündnis 90/Die Grünen. Wer enthält sich? – Die Fraktion Die Linke. Der Antrag ist abgelehnt.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'AfD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 92,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 67,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'FDP',
              deviants: {
                yes: 80,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'ABSTINATION',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 69,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title: 'Epidemische Lage von nationaler Tragweite sofort aufheben',
        procedureId: '281303',
        type: 'Antrag',
        votes: 2276,
        communityVotes: {
          yes: 1550,
          no: 666,
          abstination: 60,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-08-25T16:50:00.000Z',
        subjectGroups: ['Gesundheit', 'Recht'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 92,
          no: 615,
          abstination: 0,
          notVoted: null,
          decisionText:
            'Wer stimmt für diesen Antrag? – Wer stimmt dagegen? – Wer enthält sich? – Der Antrag ist mit den Stimmen der Koalitionsfraktionen, der FDP-Fraktion, der Fraktion Die Linke und der Fraktion Bündnis 90/Die Grünen gegen die Stimmen der AfD-Fraktion abgelehnt.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'AfD',
              deviants: {
                yes: 92,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 67,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 80,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 69,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title:
          'Feststellung des Fortbestehens der epidemischen Lage von nationaler Tragweite',
        procedureId: '281340',
        type: 'Antrag',
        votes: 2620,
        communityVotes: {
          yes: 758,
          no: 1706,
          abstination: 156,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-08-25T16:50:00.000Z',
        subjectGroups: ['Gesundheit', 'Recht'],
        currentStatus: 'Angenommen',
        voteResults: {
          yes: 325,
          no: 252,
          abstination: 5,
          notVoted: 127,
          decisionText: null,
          namedVote: true,
          partyVotes: [
            {
              main: 'YES',
              party: 'Union',
              deviants: {
                yes: 194,
                abstination: 5,
                no: 16,
                notVoted: 30,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'SPD',
              deviants: {
                yes: 131,
                abstination: 0,
                no: 2,
                notVoted: 19,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'AfD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 66,
                notVoted: 18,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 58,
                notVoted: 22,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 48,
                notVoted: 21,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 54,
                notVoted: 13,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'fraktionslos',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 8,
                notVoted: 4,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title:
          'Notwendige Schutzmaßnahmen weiter ermöglichen - Übergangsregelung für verantwortungsvollen Ausstieg aus dem Pandemie-Sonderrecht schaffen',
        procedureId: '281235',
        type: 'Antrag',
        votes: 1390,
        communityVotes: {
          yes: 609,
          no: 634,
          abstination: 147,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-08-25T16:50:00.000Z',
        subjectGroups: ['Gesundheit'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 67,
          no: 571,
          abstination: 69,
          notVoted: null,
          decisionText:
            'Wer stimmt für diesen Antrag? – Die Fraktion Bündnis 90/Die Grünen. Wer stimmt dagegen? – Die Koalitionsfraktionen, die AfD-Fraktion und die FDP-Fraktion. Wer enthält sich? – Die Fraktion Die Linke. Der Antrag ist abgelehnt.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'AfD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 92,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'Grüne',
              deviants: {
                yes: 67,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 80,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'ABSTINATION',
              party: 'Linke',
              deviants: {
                yes: 0,
                abstination: 69,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title:
          'Einsatz bewaffneter deutscher Streitkräfte zur militärischen Evakuierung aus Afghanistan',
        procedureId: '281130',
        type: 'Antrag',
        votes: 1090,
        communityVotes: {
          yes: 499,
          no: 528,
          abstination: 63,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-08-25T12:15:00.000Z',
        subjectGroups: [
          'Außenpolitik und internationale Beziehungen',
          'Verteidigung',
        ],
        currentStatus: 'Angenommen',
        voteResults: {
          yes: 538,
          no: 9,
          abstination: 89,
          notVoted: 73,
          decisionText: null,
          namedVote: true,
          partyVotes: [
            {
              main: 'YES',
              party: 'Union',
              deviants: {
                yes: 229,
                abstination: 0,
                no: 0,
                notVoted: 16,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'SPD',
              deviants: {
                yes: 143,
                abstination: 0,
                no: 0,
                notVoted: 9,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'ABSTINATION',
              party: 'AfD',
              deviants: {
                yes: 26,
                abstination: 43,
                no: 1,
                notVoted: 14,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'FDP',
              deviants: {
                yes: 71,
                abstination: 0,
                no: 0,
                notVoted: 9,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'ABSTINATION',
              party: 'Linke',
              deviants: {
                yes: 5,
                abstination: 43,
                no: 7,
                notVoted: 14,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'Grüne',
              deviants: {
                yes: 60,
                abstination: 0,
                no: 0,
                notVoted: 7,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'fraktionslos',
              deviants: {
                yes: 4,
                abstination: 3,
                no: 1,
                notVoted: 4,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
      {
        title:
          'Arbeitszeitverkürzung in der Pflege - Sechs-Stunden-Schichten retten Leben',
        procedureId: '262191',
        type: 'Antrag',
        votes: 2755,
        communityVotes: {
          yes: 2087,
          no: 469,
          abstination: 199,
          __typename: 'CommunityVotes',
        },
        voteDate: '2021-06-25T17:20:00.000Z',
        subjectGroups: ['Arbeit und Beschäftigung', 'Gesundheit'],
        currentStatus: 'Abgelehnt',
        voteResults: {
          yes: 69,
          no: 571,
          abstination: 67,
          notVoted: null,
          decisionText:
            'Der Ausschuss empfiehlt in seiner Beschlussempfehlung auf Drucksache 19/31068, den Antrag der Fraktion Die Linke auf Drucksache 19/19141 abzulehnen. Wer stimmt für diese Beschlussempfehlung? – Wer stimmt dagegen? – Wer enthält sich? – Die Beschlussempfehlung ist angenommen. Zustimmung von SPD, CDU/CSU, FDP und AfD. Gegenstimme von den Linken. Enthaltung von den Grünen.',
          namedVote: false,
          partyVotes: [
            {
              main: 'NO',
              party: 'Union',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 246,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'SPD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 153,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'AfD',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 92,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'ABSTINATION',
              party: 'Grüne',
              deviants: {
                yes: 0,
                abstination: 67,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'NO',
              party: 'FDP',
              deviants: {
                yes: 0,
                abstination: 0,
                no: 80,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
            {
              main: 'YES',
              party: 'Linke',
              deviants: {
                yes: 69,
                abstination: 0,
                no: 0,
                notVoted: null,
                __typename: 'Deviants',
              },
              __typename: 'PartyVote',
            },
          ],
          __typename: 'VoteResult',
        },
        __typename: 'Procedure',
      },
    ],
  },
};

/**
 * just a hacky dummy for getting correct data
 * @param term string
 * @returns string
 */
const getImage = (term: string) =>
  `https://democracy-app.de/static/images/sachgebiete/${encodeURIComponent(
    term
      ?.replace(/ /g, '_')
      .replace(/-/g, '_')
      .toLowerCase()
      .replace(/_und_/g, '_')
      .replace(/,/g, '_')
      .replace(/__/g, '_')
      .replace(/ß/g, 'ss')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace('aussenpolitik_internationale_beziehungen', 'aussenpolitik')
      .replace('raumordnung_bau_wohnungswesen', 'bauwesen')
  )}_648.jpg`;

const Index = () => {
  /* const router = useRouter(); */

  return (
    <Main meta={<Meta title={''} description={''} />}>
      <div className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        {/* <div className="absolute inset-0">
          <div className="h-1/3 bg-white sm:h-2/3" />
        </div> */}
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Abgestimmt
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
              Hier siehst Du alle bereits abgestimmten Vorgänge
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <FilterDropdown />
          </div>
          <div className="3xl:grid-cols-4 mx-auto mt-6 grid max-w-md gap-5 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
            {data.data.procedures.map((item) => (
              <div
                key={item.title}
                className="flex flex-col overflow-hidden rounded-lg border shadow-lg"
              >
                {/* <DonutChart
                  colors={['#16C063', '#2882E4', '#EC3E31']}
                  innerTextBottom="Abstimmende"
                  innerTextTop="3"
                  size={500}
                  topLeftText="Bundesweit"
                  votesData={{
                    abstination: 1,
                    no: 1,
                    yes: 1,
                  }}
                /> */}
                <div className="shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src={getImage(item.subjectGroups[0]!)}
                    alt=""
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">
                      <a href={item.type} className="hover:underline">
                        {item.type}
                      </a>
                    </p>
                    <a href={item.type} className="mt-2 block">
                      <p className="text-xl font-semibold text-gray-900 line-clamp-3">
                        {item.title}
                      </p>
                      {/* <p className="mt-3 text-base text-gray-500">
                        {item.description}
                      </p> */}
                    </a>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div>
                      {/* <p className="text-sm font-medium text-gray-900">
                        <a href={item.author.href} className="hover:underline">
                          {item.author.name}
                        </a>
                      </p> */}
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={item.voteDate}>
                          {dayjs(item.voteDate).format('DD.MM.YYYY')}
                        </time>
                        {/* {item.subjectGroups[0]?.replace(' ', '_').toLowerCase()} */}
                        {/* <span aria-hidden="true">&middot;</span>
                        <span>{item.voteDate}</span> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Main>
  );
};

export default Index;
