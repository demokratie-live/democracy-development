import isEmail from 'validator/lib/isEmail';
import { verify, hash } from '../../../lib/password';

export default {
  Query: {},
  Mutation: {
    signIn: async (parent, { email, password }, { UserModel, res }) => {
      if (!isEmail(email)) {
        return Promise.reject(Error('invalid email'));
      }

      let user = await UserModel.findOne({ email });
      if (user) {
        const isPasswordValid = verify(password, user.password);
        if (isPasswordValid) {
          user.jwt = user.createToken(res);
          return user;
        }
        return Promise.reject(Error('password incorrect'));
      }
      user = await UserModel.create({ email, password: await hash(password, 10) });

      user.jwt = user.createToken(res);
      return user;
    },
  },
};
