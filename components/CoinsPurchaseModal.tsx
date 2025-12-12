import React from 'react';

interface Props {
  [key: string]: any;
}

const Component: React.FC<Props> = (props) => {
  return (
    <div className="flex items-center justify-center p-4">
      <p className="text-gray-400">Component placeholder</p>
    </div>
  );
};

export default Component;
