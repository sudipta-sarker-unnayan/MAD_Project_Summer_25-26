


```bash
npm install
npx expo start


## Available imports

```js
// Components
import { PrimaryButton, SecondaryButton, InputField, Avatar, Badge, Card, colors } from '../components/index';

// Auth
import { useAuth } from '../context/AuthContext';
const { user, login, logout } = useAuth();

// Data
import { members } from '../data/dummyData';

// Theme
import { colors } from '../theme/colors';
import { typography, spacing, radius } from '../theme/typography';



