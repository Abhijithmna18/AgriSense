import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import './WidgetGrid.css';

const WidgetGrid = ({ widgets, onLayoutChange, isEditMode = false }) => {
    const [layout, setLayout] = useState(widgets.map(w => w.layout));

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
        if (onLayoutChange) {
            onLayoutChange(newLayout);
        }
    };

    return (
        <GridLayout
            className="widget-grid"
            layout={layout}
            cols={12}
            rowHeight={80}
            width={1200}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".widget-drag-handle"
            compactType="vertical"
            preventCollision={false}
        >
            {widgets.map((widget) => (
                <div key={widget.id} className="widget-container">
                    {widget.component}
                </div>
            ))}
        </GridLayout>
    );
};

export default WidgetGrid;
