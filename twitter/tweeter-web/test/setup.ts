import '@testing-library/jest-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Match the application's icon registration when rendering the OAuth controls.
library.add(fab);
