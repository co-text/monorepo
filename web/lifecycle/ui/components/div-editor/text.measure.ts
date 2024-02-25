import {getOrAdd} from "@cmmn/core";

export class TextMeasure {
    private cache = new Map<string, TextMetrics>();
    private canvas = document.createElement('canvas');
    private context = this.canvas.getContext('2d');

    constructor(private element: HTMLElement) {
        this.setFont();
    }

    private setFont(){
        const style = window.getComputedStyle(this.element);
        const font = [
            style.getPropertyValue('font-size'),
            style.getPropertyValue('font-family')
        ].join(' ');
        // console.log(font)
        this.context.font = font;
    }

    public getWidth(text: string){
        this.setFont();
        let sum = 0;
        for (const w of this.getMeasures(text)){
            sum += w.width;
        }
        return sum;
    }

    public *getMeasures(text: string){
        for (let char of text) {
            yield getOrAdd(this.cache, char, ch => this.context.measureText(ch))
        }
    }

    public getPosition(text: string, x: number){
        this.setFont();
        let position = 0;
        let index = 0;
        for (const measure of this.getMeasures(text.substring(index))){
            if (Math.abs(position - x) < measure.width / 2) {
                break;
            }
            position += measure.width;
            index++;
            if (Math.abs(position - x) < measure.width / 2) {
                break;
            }
        }
        return index;
    }

    public *getLines(text: string, lineWidth: number) {
        let index = 0;
        let position = 0;
        let line = '';
        while (true) {
            let spaceIndex = text.indexOf(' ', index);
            if (spaceIndex == -1){
                spaceIndex = text.length;
            }
            const width = this.getWidth(text.substring(index, spaceIndex));
            if (position + width >= lineWidth) {
                yield line;
                line = '';
                position = 0;
            }
            line += text.substring(index, spaceIndex + 1);
            if (spaceIndex == text.length) {
                yield line;
                break;
            }
            position += width + this.getWidth(' ');
            index = spaceIndex + 1;
        }
    }
}