import React from 'react';
import { Card } from '../shared/Card';

export const RareDiseaseDatabase: React.FC = () => {
    return (
        <Card title="Rare Disease Database">
             <p className="text-sm text-gray-500">
                This feature is under development. Soon you'll be able to query a database of rare diseases based on symptoms.
            </p>
        </Card>
    );
};
