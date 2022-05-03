import * as Config from './client-config.mjs'
import * as Helpers from '../../shared/helpers.mjs';

const anim_speed_factor = 1.0; // TOOD: use css variables to affect css animation timing too

export async function animateCard(card_name, animation){
    let card = c.app.cardFromDeck(card_name);
    let og_card = {...card};
    // console.log('animate',animation);
    for(let i = 0; i < animation.length; i++){
        let anim = animation[i];

        // this might be easier if we didn't have to clone the whole thing
        // for each keyframe
        // if props was a sub-property, we could clone, og_props, og_styles, og_classnames

        // let card_next = {
        //     ...og_card,
        //     // ...anim?.properties ?? {},
        //     ...{
        //         classnames: {
        //             ...og_card?.classnames ?? {},
        //             ...anim?.classnames ?? {}
        //         }
        //     },
        //     ...{
        //         style: {
        //             ...og_card?.style ?? {},
        //             ...anim?.style ?? {}
        //         }
        //     }
        // }
        // debugger;
        // card = card_next;
        card.classnames = {
            ...og_card?.classnames ?? {},
            ...anim?.classnames ?? {}
        }
        card.style = {
            ...og_card?.style ?? {},
            ...anim?.style ?? {}
        }
        if(anim?.properties){
            c.app.setCard(card_name, anim.properties);
        }
        console.log(anim);
        // console.log(c.app.print({
        //     before:og_card,
        //     after:card,
        // }));
        // debugger;
        await Helpers.delay(anim?.duration ?? 0);
    }
}

export const OutLeftAndBack = [
    {
        classnames: {'animation-top-to-back':true,'position-stacked':false},
        // transform: 'translateX(-300px) translateY(-50px) rotateY(12deg) rotateZ(12deg)',
        properties: {
        //     flipped: false, // flip it face down
            flipping: true,
        },
        duration: 1000, // 800 * anim_speed_factor
    },
    {
        classnames: {
            'position-stacked':true,
            'no-transition':true
        },
        properties: {
            flipping: false,
            flipped: false
        },
        duration: 100
    },
    {
        classnames: {
            'position-stacked':true,
        },
    }
];

export const OutRightAndFront = [
    {
        classnames: {
            'animation-outRightToFront':true,
            'position-stacked':false
        },
        properties: {
            flipping: true,
            flipped: true
        },
        duration: 1000,
    },
    {
        classnames: {
            'position-stacked':true,
            'no-transition':true
        },
        properties: {
            flipping: false,
            // flipped: true // turn it face up
        },
        duration: 100
    },
    {
        classnames: {
            'position-stacked':true,
        },
    }
];

export function flip(flipped_next){
    return [
        {
            properties: {
                flipping: true,
                flipped: flipped_next
            },
            duration: Config.CARD_FLIP_TIME
        },
        {
            properties: {
                flipping: false,
                flipped: flipped_next
            }
        }
    ]
}