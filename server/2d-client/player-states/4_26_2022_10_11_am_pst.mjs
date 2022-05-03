export default {
    "id": "player-001",
    "name": "",
    "active_theme": "default",
    "focused_deck": "id2510.899999976158",
    "focused_card": "id2511.2000000476837",
    "active_hand": "id2510.899999976158",
    "hands": {
      "welcome": {
        "id": "welcome",
        "name": "welcome",
        "cards": {
          "welcome": {
            "id": "welcome",
            "name": "welcome",
            "deck_order": 1,
            "front": {
              "text": "Welcome to CardBox",
              "text_lower": "v. 0.0.1"
            },
            "back": {},
            "actions": [
              {
                "name": "nextCard"
              }
            ],
            "deck_name": "welcome",
            "player_id": "player-001",
            "flipped": true,
            "classnames": {
              "position-stacked": true
            },
            "instance": {
              "name": "welcome"
            },
            "style": {},
            "flipping": false
          },
          "welcome2": {
            "deck_order": 2,
            "inputs": [
              {
                "label": "what's your name?",
                "type": "text",
                "name": "player name",
                "placeholder": "new player name...",
                "required": true
              }
            ],
            "actions": [
              {
                "name": "nextCard"
              }
            ],
            "front": {
              "text": ""
            },
            "name": "welcome2",
            "deck_name": "welcome",
            "player_id": "player-001",
            "flipped": false,
            "classnames": {
              "position-stacked": true
            },
            "instance": {
              "name": "welcome2"
            }
          },
          "welcome3": {
            "deck_order": 3,
            "front": {
              "text": "hello, {{player.name}}. <br/> want a quick intro?"
            },
            "actions": [
              {
                "name": "goToCard",
                "card": "setup1",
                "label": "no"
              },
              {
                "name": "goToCard",
                "card": "info1",
                "label": "yes"
              }
            ],
            "name": "welcome3",
            "deck_name": "welcome",
            "player_id": "player-001",
            "flipped": false,
            "classnames": {
              "position-stacked": true
            },
            "instance": {
              "name": "welcome3"
            }
          },
          "setup1": {
            "front": {
              "text": "Pick a theme"
            },
            "inputs": [
              {
                "label": "theme",
                "type": "select",
                "name": "theme",
                "required": true,
                "options": [
                  {
                    "name": "default",
                    "value": "default"
                  },
                  {
                    "name": "dark",
                    "value": "dark"
                  },
                  {
                    "name": "light",
                    "value": "light"
                  },
                  {
                    "name": "blue",
                    "value": "blue"
                  }
                ]
              }
            ],
            "actions": [
              {
                "name": "goToCard",
                "card": "setup2",
                "label": "next"
              }
            ],
            "name": "setup1",
            "deck_name": "welcome",
            "player_id": "player-001",
            "flipped": false,
            "classnames": {
              "position-stacked": true
            },
            "instance": {
              "name": "setup1"
            }
          },
          "setup2": {
            "front": {
              "text": "Let's create your first deck"
            },
            "inputs": [
              {
                "label": "deck",
                "type": "select",
                "name": "deck",
                "options": [
                  {
                    "name": "blank",
                    "selected": true
                  },
                  {
                    "name": "mind map"
                  },
                  {
                    "name": "mood board"
                  },
                  {
                    "name": "prototype"
                  },
                  {
                    "name": "storyboard"
                  },
                  {
                    "name": "flash cards"
                  },
                  {
                    "name": "playing cards"
                  },
                  {
                    "name": "tarot cards"
                  },
                  {
                    "name": "index cards"
                  },
                  {
                    "name": "todo list deck"
                  },
                  {
                    "name": "pokemon cards"
                  },
                  {
                    "name": "tetris cards"
                  },
                  {
                    "name": "uno cards"
                  }
                ],
                "required": true
              }
            ],
            "actions": [
              {
                "label": "Create Deck",
                "name": "createDeckAndFocus",
                "deck": "{{deck}}"
              }
            ],
            "name": "setup2",
            "deck_name": "welcome",
            "player_id": "player-001",
            "flipped": false,
            "classnames": {
              "position-stacked": true
            },
            "instance": {
              "name": "setup2"
            }
          },
          "info1": {
            "front": {
              "text": "CardBox is an experimental ecosystem for collaborative systems design with a primary goal of making programming collaborative, approachable, and fun! <br/>"
            },
            "actions": [
              {
                "name": "goToCard",
                "card": "info2",
                "label": "more info"
              },
              {
                "name": "goToCard",
                "card": "setup2",
                "label": "pick a starter deck"
              }
            ],
            "name": "info1",
            "deck_name": "welcome",
            "player_id": "player-001",
            "flipped": false,
            "classnames": {
              "position-stacked": true
            },
            "instance": {
              "name": "info1"
            }
          },
          "info2": {
            "front": {
              "text": "More info about CardBox",
              "text_lower": "v. 0.0.1"
            },
            "actions": [
              {
                "name": "goToCard",
                "card": "info_inspiration",
                "label": "inspiration"
              },
              {
                "name": "goToCard",
                "card": "info_contributors",
                "label": "contributors"
              },
              {
                "name": "goToCard",
                "card": "info_philosophy",
                "label": "philosophy"
              },
              {
                "name": "goToCard",
                "card": "info_progress",
                "label": "progress"
              },
              {
                "name": "goToCard",
                "card": "info_roadmap",
                "label": "roadmap"
              },
              {
                "name": "goToCard",
                "card": "info_team",
                "label": "team"
              },
              {
                "name": "goToCard",
                "card": "info_contact",
                "label": "contact"
              },
              {
                "name": "goToCard",
                "card": "info1",
                "label": "back"
              }
            ],
            "name": "info2",
            "deck_name": "welcome",
            "player_id": "player-001",
            "flipped": false,
            "classnames": {
              "position-stacked": true
            },
            "instance": {
              "name": "info2"
            }
          }
        },
        "card_order": [
          "welcome",
          "welcome2",
          "welcome3",
          "setup1",
          "setup2",
          "info1",
          "info2"
        ],
        "hand_order": [
          "welcome",
          "welcome2",
          "welcome3",
          "setup1",
          "setup2",
          "info1",
          "info2"
        ]
      },
      "id2510.899999976158": {
        "id": "id2510.899999976158",
        "player_id": "player-001",
        "hand_order": [
          "id1018385.3999999762",
          "id820440.3999999762",
          "id804175.1000000238",
          "id663259.7000000477",
          "id658323.1000000238",
          "id651787.5",
          "id422976.60000002384",
          "id276564.3000000715",
          "id39425.300000071526",
          "id29840.700000047684",
          "id15495.100000023842",
          "id2511.2000000476837"
        ],
        "card_order": [
          "id1018385.3999999762",
          "id820440.3999999762",
          "id804175.1000000238",
          "id663259.7000000477",
          "id658323.1000000238",
          "id651787.5",
          "id422976.60000002384",
          "id276564.3000000715",
          "id39425.300000071526",
          "id29840.700000047684",
          "id15495.100000023842",
          "id2511.2000000476837"
        ],
        "cards": {
          "id2511.2000000476837": {
            "id": "id2511.2000000476837",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "Create Card"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id2511.2000000476837"
            },
            "inputs": [
              {
                "type": "textarea",
                "name": "card_name",
                "placeholder": "Card Title..."
              }
            ],
            "actions": [
              {
                "name": "createCardFromInput",
                "label": "create card"
              }
            ],
            "attributes": [
              "createCard"
            ],
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id2511.399999976158": {
            "id": "id2511.399999976158",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "Pick Deck Type"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id2511.399999976158"
            },
            "inputs": [
              {
                "label": "deck",
                "type": "select",
                "name": "deck",
                "options": [
                  {
                    "name": "blank",
                    "selected": true
                  },
                  {
                    "name": "mind map"
                  },
                  {
                    "name": "mood board"
                  },
                  {
                    "name": "prototype"
                  },
                  {
                    "name": "storyboard"
                  },
                  {
                    "name": "flash cards"
                  },
                  {
                    "name": "playing cards"
                  },
                  {
                    "name": "tarot cards"
                  },
                  {
                    "name": "index cards"
                  },
                  {
                    "name": "todo list deck"
                  },
                  {
                    "name": "pokemon cards"
                  },
                  {
                    "name": "tetris cards"
                  },
                  {
                    "name": "uno cards"
                  }
                ],
                "required": true
              }
            ],
            "actions": [
              {
                "name": "selectDeckType",
                "label": "next"
              }
            ],
            "attributes": [
              "deckTypeSelector"
            ]
          },
          "id15495.100000023842": {
            "id": "id15495.100000023842",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "todo: rename decks\n"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id15495.100000023842"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id29840.700000047684": {
            "id": "id29840.700000047684",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "TODO\n\nstyle\n\ntext input"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id29840.700000047684"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id39425.300000071526": {
            "id": "id39425.300000071526",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "todo\n\nrender new lines as breaks"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id39425.300000071526"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id276564.3000000715": {
            "id": "id276564.3000000715",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "another one\n"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id276564.3000000715"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id422976.60000002384": {
            "id": "id422976.60000002384",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "second row\n"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id422976.60000002384"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id651787.5": {
            "id": "id651787.5",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "soon you can add things rapid fire\n"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id651787.5"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id658323.1000000238": {
            "id": "id658323.1000000238",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "and the display will keep zooming out\n"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id658323.1000000238"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id663259.7000000477": {
            "id": "id663259.7000000477",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "there will be zoom options too\n"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id663259.7000000477"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id804175.1000000238": {
            "id": "id804175.1000000238",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "i need to separate the \"hand\" (where this create card is) and the \"table\" or ... \"desktop?\" i don't know what to call it... surface? space? anyway, that's where the cards \"land\" after you create them. it's like the staging area for seeing an overview of the deck and sorting them... then you can click on a specific card and it will zoom up above the rest (perhaps blurring the ones on the table) and you can edit just that card, or select multiple ...\n\nthen there will be a secondary spot on the side where you can temporarily create stacks of cards, to do like sub-groups, you can keep them over there as like \"draft\" cards, or, you can drag a single one, or a while side-stack back into the main flow \n"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id804175.1000000238"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id820440.3999999762": {
            "id": "id820440.3999999762",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "TODO: how to handle long text? i guess make cards scrollable...\n"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id820440.3999999762"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          },
          "id1018385.3999999762": {
            "id": "id1018385.3999999762",
            "flipped": true,
            "deck_name": "id2510.899999976158",
            "front": {
              "text": "if you drag a card over another one and hold it, it will create a sub-stack, like folders on iphone home screen\n"
            },
            "player_id": "player-001",
            "instance": {
              "name": "id1018385.3999999762"
            },
            "stack": 2,
            "classnames": {},
            "style": {},
            "flipping": false
          }
        },
        "name": "blank"
      }
    },
    "stacks": {}
  }