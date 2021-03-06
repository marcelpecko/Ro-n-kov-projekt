const state = {
  register: {
    name: '',
    surname: '',
    email: '',
    password: '',
    passwordRepeat: '',
  },
  login: {
    email: '',
    password: '',
  },
  user: undefined,
  boarder: {
    name: '',
    surname: '',
    diet: '',
  },
  boarders: [],
  menu: [], // array of pairs (2 element array)
  currentBoarderId: undefined,
  notice: undefined,
  week: '',
}

export default () => state
