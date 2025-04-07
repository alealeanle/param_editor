import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import s from './App.module.css'

export interface Param {
  id: number;
  name: string;
  type: 'string';
}

interface ParamValue {
  paramId: number;
  value: string;
}

interface Color {
  [key: string]: any;
}

interface Model {
  paramValues: ParamValue[];
  colors: Color[];
}

interface Props {
  params: Param[];
  model: Model;
  onModelChange?: (model: Model) => void;
}

interface State {
  paramValues: Record<number, string>;
}

export class ParamEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const paramValues: Record<number, string> = {};
    props.model.paramValues.forEach(pv => {
      paramValues[pv.paramId] = pv.value;
    });
    props.params.forEach(param => {
      if (!(param.id in paramValues)) {
        paramValues[param.id] = '';
      }
    });
    this.state = { paramValues };
  }

  handleChange = (paramId: number, value: string) => {
    this.setState(prevState => {
      const updated = {
        ...prevState.paramValues,
        [paramId]: value,
      };
      this.props.onModelChange?.({
        paramValues: Object.entries(updated).map(([id, val]) => ({
          paramId: Number(id),
          value: val,
        })),
        colors: this.props.model.colors || [],
      });
      return { paramValues: updated };
    });
  };

  public getModel(): Model {
    return {
      paramValues: Object.entries(this.state.paramValues).map(([paramId, value]) => ({
        paramId: Number(paramId),
        value,
      })),
      colors: this.props.model.colors || [],
    };
  }

  render() {
    return (
      <div>
        {this.props.params.map(param => (
          <div key={param.id} className={s.param}>
            <label>
              {param.name}:<br />
              {renderInput(param, this.state.paramValues[param.id], this.handleChange)}
            </label>
          </div>
        ))}
      </div>
    );
  }
}

function renderInput(
  param: Param,
  value: string,
  onChange: (paramId: number, value: string) => void
) {
  switch (param.type) {
    case 'string':
      return (
        <input
          type="text"
          value={value}
          onChange={e => onChange(param.id, e.target.value)}
        />
      );
    default:
      return <span>Unsupported param type: {param.type}</span>;
  }
}

  const params: Param[] = [
    { id: 1, name: 'Назначение', type: 'string' },
    { id: 2, name: 'Длина', type: 'string' },
  ];

  const model: Model = {
    paramValues: [
      { paramId: 1, value: 'повседневное' },
      { paramId: 2, value: 'макси' },
    ],
    colors: [],
  };

const App = forwardRef((_, ref) => {
  const editorRef = useRef<ParamEditor>(null);
  const [modelOutput, setModelOutput] = useState<Model | null>(null);


  useImperativeHandle(ref, () => ({
    getModel: () => editorRef.current?.getModel(),
  }));

  const handleClick = () => {
    const data = editorRef.current?.getModel();
    if (data) setModelOutput(data);
  };

  return (
    <div className={s.appRoot}>
      <h2>Редактор параметров</h2>
      <ParamEditor ref={editorRef} params={params} model={model} />
      <button onClick={handleClick} className={s.btn}>
        Получить модель
      </button>
      {modelOutput && (
        <pre className={s.modelOutput}>
          {JSON.stringify(modelOutput, null, 2)}
        </pre>
      )}
    </div>
  );
});

export default App;
