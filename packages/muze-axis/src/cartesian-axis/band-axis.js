import SimpleAxis from './simple-axis';
import { BAND } from '../enums/scale-type';
import { TOP, BOTTOM } from '../enums/axis-orientation';
import { calculateBandSpace, setOffset } from './helper';

export default class BandAxis extends SimpleAxis {

    /**
     *
     *
     * @param {*} range
     * @returns
     * @memberof BandAxis
     */
    createScale (range) {
        const scale = super.createScale(range);
        const { padding } = this.config();
        if (typeof padding === 'number') {
            scale.padding(padding);
        }
        return scale;
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof BandAxis
     */
    static type () {
        return BAND;
    }

    /**
     *
     *
     * @param {*} width
     * @param {*} height
     * @param {*} padding
     * @param {*} isOffset
     * @memberof BandAxis
     */
    setAvailableSpace (width, height, padding, isOffset) {
        const {
            left,
            right,
            top,
            bottom
        } = padding;
        const {
            orientation
        } = this.config();
        const { axisNameDimensions } = this.axisComponentDimensions();

        this.availableSpace({ width, height });
        if (orientation === TOP || orientation === BOTTOM) {
            // Set x axis range
            this.range([0, width - left - right]);
            isOffset && this.config({ yOffset: height });
            // set smart ticks and rotation config
            this.smartTicks(this.setTickConfig((width - left - right / this.domain().length) - this._minTickDistance.width, height));

            this.config({
                labels: this.tickTextManager.manageTicks(this.config(), {
                    availSpace: width - left - right,
                    totalTickWidth: this.smartTicks().reduce((acc, n) => acc + n.width + this._minTickDistance.width, 0)
                })
            });
        } else {
            // Set y axis range
            this.range([height - bottom, top]);
            isOffset && this.config({ xOffset: width });

            this.smartTicks(this.setTickConfig(width - axisNameDimensions.height, height, true));

            this.config({ labels: {
                rotation: 0,
                smartTicks: true
            } });
        }
        return this;
    }

    /**
     *
     *
     * @returns
     * @memberof BandAxis
     */
    getUnitWidth () {
        return this.scale().bandwidth();
    }

    /**
     *
     *
     * @returns
     * @memberof BandAxis
     */
    setTickConfig (width, height, noWrap = false) {
        let smartTicks = '';
        let smartlabel;
        const { tickFormat } = this.config();
        const { labelManager } = this._dependencies;
        const domain = this.domain();

        smartTicks = domain;
        const tickFormatter = tickFormat || (val => val);

        if (domain && domain.length) {
            smartTicks = domain.map((d, i) => {
                labelManager.useEllipsesOnOverflow(true);

                smartlabel = labelManager.getSmartText(tickFormatter(d, i, domain),
                    Math.max(this._minTickSpace.width, width), height, noWrap);
                return labelManager.constructor.textToLines(smartlabel);
            });
        }
        return smartTicks;
    }

/**
     * Gets the space occupied by the axis
     *
     * @return {Object} object with details about size of the axis.
     * @memberof SimpleAxis
     */
    getLogicalSpace () {
        if (!this.logicalSpace()) {
            this.logicalSpace(calculateBandSpace(this));
            setOffset(this);
            this.logicalSpace();
        }
        return this.logicalSpace();
    }

    /**
     *
     *
     * @returns
     * @memberof BandAxis
     */
    getTickValues () {
        return this.axis().scale().domain();
    }

    /**
     *
     *
     * @returns
     * @memberof SimpleAxis
     */
    getTickSize () {
        const {
            showInnerTicks,
            showOuterTicks
        } = this.config();
        const axis = this.axis();

        axis.tickSizeInner(showInnerTicks ? 6 : 0);
        axis.tickSizeOuter(showOuterTicks ? 6 : 0);
        return axis.tickSize();
    }

    /**
     * This method is used to assign a domain to the axis.
     *
     * @param {Array} domain the domain of the scale
     * @memberof SimpleAxis
     */
    updateDomainBounds (domain) {
        let currentDomain = this.domain();
        if (this.config().domain) {
            currentDomain = this.config().domain;
        } else {
            if (currentDomain.length === 0) {
                currentDomain = domain;
            }
            currentDomain = currentDomain.concat(domain);
        }
        this.domain(currentDomain);
        return this;
    }

    /**
     * Returns the value from the domain when given a value from the range.
     * @param {number} value Value from the range.
     * @return {number} Value
     */
    invert (...value) {
        const values = value.map(d => this.scale().invert(d)) || [];
        return value.length === 1 ? values[0] && values[0].toString() : values.map(d => d.toString());
    }
}
