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
        for (const measure of this.getMeasures(text)){
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
        for (let part of text.split('\n')) {
            if (part == ''){
                yield '';
                continue;
            }
            let position = 0;
            let line = '';
            let index = 0;
            for (let word of part.split(/[^\w]/g)){
                const width = this.getWidth(word);
                if (position + width >= lineWidth) {
                    yield line;
                    line = '';
                    position = 0;
                }
                const symbol = part[index + word.length] ?? '';
                line += word + symbol;
                position += width + this.getWidth(symbol);
                index += word.length + 1;
            }
            if (line.length)
                yield line;
        }
    }
}