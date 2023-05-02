import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from 'router';


function App() {
  return (
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App


