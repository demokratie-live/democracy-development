import DipAPI from './DipAPI'

export default {
  Query: {
    procedures: (_parent: any, _args: any, { dataSources: { dipAPI } }: { dataSources: { dipAPI: DipAPI } }) => {
      return dipAPI.getProcedures()
    }
  }
}
