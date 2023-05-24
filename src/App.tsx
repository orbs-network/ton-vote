import { APP_NAME } from 'config';
import { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { RouterProvider } from 'react-router-dom';
import { router } from 'router/router';
import { errorToast } from 'toasts';


function App() {  

  return (
    <Suspense>
      <Helmet>
        <title>{APP_NAME}</title>
      </Helmet>
        <RouterProvider router={router} />
    </Suspense>
  );
}

export default App


