import bcrypt from 'bcrypt';
import isEmail from 'validator/lib/isEmail';

export default {
  Query: {},
  Mutation: {
    signIn: async (parent, { email, password }, { UserModel, res }) => {
      if (!isEmail(email)) {
        return Promise.reject(Error('invalid email'));
      }

      let user = await UserModel.findOne({ email });
      if (user) {
        return bcrypt.compare(password, user.password).then((passwordCorrect) => {
          if (passwordCorrect) {
            user.jwt = user.createToken(res);
            return user;
          }
          return Promise.reject(Error('password incorrect'));
        });
      }
      user = await UserModel.create({ email, password: await bcrypt.hash(password, 10) });
      console.log('user', user);
      user.jwt = user.createToken(res);
      return user;
    },
  },
};
