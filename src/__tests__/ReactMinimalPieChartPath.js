import React from 'react';
import { shallow } from 'enzyme';
import PieChartPath from '../ReactMinimalPieChartPath';
import { degreesToRadians } from '../utils';

describe('ReactMinimalPieChartPath component', () => {
  it('Should return a "path" element with defined "d" prop', () => {
    const wrapper = shallow(<PieChartPath cx={100} cy={100} />);

    expect(wrapper.type()).toBe('path');
    expect(typeof wrapper.prop('d')).toBe('string');
  });

  it('Should render a path with "strokeWidth" = 5', () => {
    const wrapper = shallow(<PieChartPath cx={100} cy={100} lineWidth={5} />);
    expect(wrapper.prop('strokeWidth')).toBe(5);
  });

  describe('reveal', () => {
    const pathLength = degreesToRadians(50) * 360;

    describe('100', () => {
      it('Renders a fully revealed path with "strokeDasharray" === path length & "strokeDashoffset" === 0', () => {
        const wrapper = shallow(
          <PieChartPath
            cx={100}
            cy={100}
            lengthAngle={360}
            radius={100}
            reveal={100}
          />
        );

        expect(wrapper.prop('strokeDasharray')).toBe(pathLength);
        expect(wrapper.prop('strokeDashoffset')).toBe(0);
      });
    });

    describe('0', () => {
      it('Renders a fully hidden path with "strokeDashoffset" === "strokeDasharray"', () => {
        const wrapper = shallow(
          <PieChartPath cx={100} cy={100} lengthAngle={360} reveal={0} />
        );

        expect(wrapper.prop('strokeDasharray')).toBe(pathLength);
        expect(wrapper.prop('strokeDashoffset')).toBe(pathLength);
      });
    });

    describe('with negative "lengthAngle"', () => {
      it('Renders a path with negative "strokeDashoffset"', () => {
        const wrapper = shallow(
          <PieChartPath cx={100} cy={100} lengthAngle={-360} reveal={0} />
        );

        expect(wrapper.prop('strokeDasharray')).toBe(pathLength);
        expect(wrapper.prop('strokeDashoffset')).toBe(-pathLength);
      });
    });
  });
});
