import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';

import type { FC } from 'react';


const Component: FC = () => {
  return (
    <div>
      <h1>Index Page</h1>
      <NavLink to={'/home'} >
        <span>Go to Home</span>
      </NavLink>
    </div>
  );
};


export const IndexPage = styled(Component)`
`;
