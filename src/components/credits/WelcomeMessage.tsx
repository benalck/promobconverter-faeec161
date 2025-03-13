
import React from 'react';

const WelcomeMessage: React.FC = React.memo(() => (
  <div className="absolute -bottom-12 right-0 bg-primary/10 text-primary text-xs rounded-md px-3 py-2 whitespace-nowrap">
    Você recebeu 3 créditos gratuitos para começar!
  </div>
));

WelcomeMessage.displayName = 'WelcomeMessage';

export default WelcomeMessage;
